import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import {
  BankStatementParserService,
  ExtractedMovement,
} from '../../infrastructure/services/bank-statement-parser.service';
import { randomUUID } from 'crypto';

export type MatchStatus =
  | 'MATCHED'
  | 'AMBIGUOUS'
  | 'UNMATCHED'
  | 'ALREADY_REGISTERED';

export interface ReconciledMovementDto {
  id: string; // ID temporal de sesión
  fecha: string;
  concepto: string;
  monto: number;
  referencia?: string;
  matchStatus: MatchStatus;
  confidenceReason?: string;
  suggestedHouseId?: string;
  suggestedHouseNumber?: string;
  suggestedResidentName?: string;
  suggestedChargeId?: string;
  chargeConcept?: string;
  chargePendingAmount?: number;
}

export interface StatementReconciliationResult {
  banco?: string;
  cuenta?: string;
  periodo?: string;
  totalMovimientos: number;
  totalMontoAbonos: number;
  resumen: {
    matched: number;
    ambiguous: number;
    unmatched: number;
    alreadyRegistered: number;
  };
  movimientos: ReconciledMovementDto[];
}

interface HouseResident {
  id: string;
  firstName: string;
  lastName: string;
}

interface HouseCharge {
  id: string;
  concept: string;
  amount: number | { toString(): string };
  paidAmount: number | { toString(): string };
}

interface HouseCandidate {
  id: string;
  houseNumber: string;
  residents: HouseResident[];
  maintenanceCharges: HouseCharge[];
}

interface RecentPaymentCandidate {
  id: string;
  amount: number | { toString(): string };
  paymentDate: Date;
  reference?: string | null;
  maintenanceChargeId: string;
  maintenanceCharge?: {
    houseId: string;
  } | null;
}

@Injectable()
export class ReconcileStatementUseCase {
  private readonly logger = new Logger(ReconcileStatementUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly parserService: BankStatementParserService,
  ) {}

  async execute(params: {
    condominiumId: string;
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
  }): Promise<StatementReconciliationResult> {
    const { condominiumId, fileBuffer, fileName, mimeType } = params;

    // 1. Extraer los abonos del archivo usando Gemini Flash o parser tabular
    const extracted = await this.parserService.parseStatement(
      fileBuffer,
      fileName,
      mimeType,
    );

    // 2. Consultar todas las casas activas del condominio con sus residentes y cargos pendientes
    const houses = await this.prisma.house.findMany({
      where: { condominiumId, isDisabled: false },
      include: {
        residents: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        maintenanceCharges: {
          where: {
            status: { in: ['PENDING', 'PARTIAL'] },
          },
          orderBy: { dueDate: 'asc' }, // Prioridad al adeudo más antiguo
        },
      },
    });

    // 3. Consultar pagos registrados recientemente para evitar duplicados
    const recentPayments = await this.prisma.payment.findMany({
      where: {
        maintenanceCharge: { condominiumId },
      },
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        reference: true,
        maintenanceChargeId: true,
        maintenanceCharge: {
          select: { houseId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const reconciledMovements: ReconciledMovementDto[] = [];
    let matchedCount = 0;
    let ambiguousCount = 0;
    let unmatchedCount = 0;
    let alreadyRegisteredCount = 0;

    for (const mov of extracted.movimientos) {
      const result = this.matchMovement(mov, houses, recentPayments);

      if (result.matchStatus === 'MATCHED') matchedCount++;
      else if (result.matchStatus === 'AMBIGUOUS') ambiguousCount++;
      else if (result.matchStatus === 'UNMATCHED') unmatchedCount++;
      else if (result.matchStatus === 'ALREADY_REGISTERED')
        alreadyRegisteredCount++;

      reconciledMovements.push(result);
    }

    const totalMontoAbonos = extracted.movimientos.reduce(
      (acc, m) => acc + (Number(m.monto) || 0),
      0,
    );

    return {
      banco: extracted.banco,
      cuenta: extracted.cuenta,
      periodo: extracted.periodo,
      totalMovimientos: extracted.movimientos.length,
      totalMontoAbonos: Number(totalMontoAbonos.toFixed(2)),
      resumen: {
        matched: matchedCount,
        ambiguous: ambiguousCount,
        unmatched: unmatchedCount,
        alreadyRegistered: alreadyRegisteredCount,
      },
      movimientos: reconciledMovements,
    };
  }

  private matchMovement(
    mov: ExtractedMovement,
    houses: HouseCandidate[],
    recentPayments: RecentPaymentCandidate[],
  ): ReconciledMovementDto {
    const tempId = randomUUID();
    const cleanConcept = (mov.concepto || '').toUpperCase();
    const cleanRef = (mov.referencia || '').toUpperCase();
    const fullText = `${cleanConcept} ${cleanRef}`;

    // Paso A: Comprobar si ya está registrado en el sistema
    if (mov.referencia && mov.referencia.length >= 4) {
      const existingRefPayment = recentPayments.find(
        (p) =>
          p.reference &&
          p.reference.toUpperCase() === cleanRef &&
          Math.abs(Number(p.amount) - mov.monto) < 0.01,
      );

      if (existingRefPayment) {
        return {
          id: tempId,
          fecha: mov.fecha,
          concepto: mov.concepto,
          monto: mov.monto,
          referencia: mov.referencia,
          matchStatus: 'ALREADY_REGISTERED',
          confidenceReason: `Ya existe un pago registrado con la misma referencia (${mov.referencia}) y monto.`,
          suggestedHouseId: existingRefPayment.maintenanceCharge?.houseId,
        };
      }
    }

    // Paso B: Buscar coincidencia de casa
    let candidateHouse: HouseCandidate | null = null;
    let matchReason = '';

    // B.1. Por número de casa sugerido por Gemini
    if (mov.numeroCasaSugerido) {
      const cleanSuggested = mov.numeroCasaSugerido.trim().toUpperCase();
      candidateHouse =
        houses.find(
          (h) => h.houseNumber.trim().toUpperCase() === cleanSuggested,
        ) || null;
      if (candidateHouse) {
        matchReason = `Identificada por número de casa detectado ("${mov.numeroCasaSugerido}").`;
      }
    }

    // B.2. Por coincidencia exacta de número de casa en el concepto
    if (!candidateHouse) {
      for (const house of houses) {
        const hNum = house.houseNumber.trim().toUpperCase();
        // Regex de palabra completa o prefijada
        const regex = new RegExp(
          `(?:\\b|C-|CASA\\s*|LOTE\\s*|DEPTO\\s*)${hNum}\\b`,
          'i',
        );
        if (regex.test(fullText)) {
          candidateHouse = house;
          matchReason = `Identificada por número de casa "${house.houseNumber}" en la descripción.`;
          break;
        }
      }
    }

    // B.3. Por nombre de residente en el concepto
    if (!candidateHouse) {
      for (const house of houses) {
        for (const res of house.residents) {
          const fn = (res.firstName || '').trim().toUpperCase();
          const ln = (res.lastName || '').trim().toUpperCase();
          if (fn.length > 2 && ln.length > 2) {
            if (cleanConcept.includes(fn) && cleanConcept.includes(ln)) {
              candidateHouse = house;
              matchReason = `Identificada por nombre de residente ("${res.firstName} ${res.lastName}").`;
              break;
            }
          }
        }
        if (candidateHouse) break;
      }
    }

    // Si encontramos la casa:
    if (candidateHouse) {
      const primaryResident = candidateHouse.residents[0];
      const residentName = primaryResident
        ? `${primaryResident.firstName} ${primaryResident.lastName}`.trim()
        : undefined;

      const pendingCharges = candidateHouse.maintenanceCharges || [];

      // Buscar si algún cargo pendiente coincide con el monto exacto
      const exactCharge = pendingCharges.find(
        (c) =>
          Math.abs(Number(c.amount) - Number(c.paidAmount) - mov.monto) < 0.01,
      );

      const targetCharge = exactCharge || pendingCharges[0];

      if (targetCharge) {
        const remaining =
          Number(targetCharge.amount) - Number(targetCharge.paidAmount);
        return {
          id: tempId,
          fecha: mov.fecha,
          concepto: mov.concepto,
          monto: mov.monto,
          referencia: mov.referencia,
          matchStatus: 'MATCHED',
          confidenceReason: exactCharge
            ? `${matchReason} Coincide exactamente con el saldo pendiente.`
            : `${matchReason} Asignado al adeudo más antiguo.`,
          suggestedHouseId: candidateHouse.id,
          suggestedHouseNumber: candidateHouse.houseNumber,
          suggestedResidentName: residentName,
          suggestedChargeId: targetCharge.id,
          chargeConcept: targetCharge.concept,
          chargePendingAmount: Number(remaining.toFixed(2)),
        };
      } else {
        // La casa fue encontrada pero no tiene adeudos pendientes
        return {
          id: tempId,
          fecha: mov.fecha,
          concepto: mov.concepto,
          monto: mov.monto,
          referencia: mov.referencia,
          matchStatus: 'AMBIGUOUS',
          confidenceReason: `${matchReason} Sin embargo, esta casa no tiene cargos de mantenimiento pendientes.`,
          suggestedHouseId: candidateHouse.id,
          suggestedHouseNumber: candidateHouse.houseNumber,
          suggestedResidentName: residentName,
        };
      }
    }

    // Si no se encontró casa, verificar si el monto coincide con una cuota típica de casas con un solo adeudo
    return {
      id: tempId,
      fecha: mov.fecha,
      concepto: mov.concepto,
      monto: mov.monto,
      referencia: mov.referencia,
      matchStatus: 'UNMATCHED',
      confidenceReason:
        'No se detectó número de casa ni nombre de residente en la transacción.',
    };
  }
}
