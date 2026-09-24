import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { StorageService } from '@/core/domain/services/storage.service';
import BillingRepository, {
  FindBillingRecordsParams,
  RegisterPaymentData,
  ReviewResidentProofData,
  UploadResidentProofData,
  UpsertBillingConfigData,
} from '../../domain/repositories/billing.repository';
import { BillingConfigEntity } from '../../domain/entities/billing-config.entity';
import { BillingRecordEntity } from '../../domain/entities/billing-record.entity';
import { BillingMapper } from '../mappers/billing.mapper';
import {
  AccountMovementType,
  PaymentMethod,
} from '@/core/infrastructure/persistence/prisma/generated/client';

import { BillingNotificationService } from '../services/billing-notification.service';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

@Injectable()
export class BillingPrismaRepository implements BillingRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PROVIDES_NAMES.StorageService)
    private readonly storageService: StorageService,
    private readonly notificationService: BillingNotificationService,
  ) {}

  async getConfig(condominiumId: string): Promise<BillingConfigEntity> {
    let config = await this.prisma.condominiumBillingConfig.findUnique({
      where: { condominiumId },
    });

    if (!config) {
      config = await this.prisma.condominiumBillingConfig.create({
        data: {
          condominiumId,
          defaultMonthlyFee: 1500.0,
          currency: 'MXN',
          dueDay: 10,
          applyLateFee: true,
          lateFeeType: 'PERCENTAGE',
          lateFeeValue: 10.0,
          gracePeriodDays: 2,
        },
      });
    }

    return BillingMapper.toConfigDomain(config);
  }

  async upsertConfig(
    condominiumId: string,
    data: UpsertBillingConfigData,
  ): Promise<BillingConfigEntity> {
    const config = await this.prisma.condominiumBillingConfig.upsert({
      where: { condominiumId },
      create: {
        condominiumId,
        defaultMonthlyFee: data.defaultMonthlyFee ?? 1500.0,
        currency: data.currency ?? 'MXN',
        dueDay: data.dueDay ?? 10,
        applyLateFee: data.applyLateFee ?? true,
        lateFeeType: data.lateFeeType ?? 'PERCENTAGE',
        lateFeeValue: data.lateFeeValue ?? 10.0,
        gracePeriodDays: data.gracePeriodDays ?? 2,
        bankName: data.bankName,
        accountHolder: data.accountHolder,
        clabe: data.clabe,
        accountNumber: data.accountNumber,
        paymentReferenceRule: data.paymentReferenceRule,
        notes: data.notes,
        notifyOnPeriodStart: data.notifyOnPeriodStart ?? true,
        notifyDueDateReminder: data.notifyDueDateReminder ?? true,
        dueDateReminderDaysBefore: data.dueDateReminderDaysBefore ?? 3,
        notifyOnProofReviewed: data.notifyOnProofReviewed ?? true,
        notificationChannel: data.notificationChannel ?? 'ALL',
      },
      update: {
        ...(data.defaultMonthlyFee !== undefined && {
          defaultMonthlyFee: data.defaultMonthlyFee,
        }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.dueDay !== undefined && { dueDay: data.dueDay }),
        ...(data.applyLateFee !== undefined && {
          applyLateFee: data.applyLateFee,
        }),
        ...(data.lateFeeType !== undefined && {
          lateFeeType: data.lateFeeType,
        }),
        ...(data.lateFeeValue !== undefined && {
          lateFeeValue: data.lateFeeValue,
        }),
        ...(data.gracePeriodDays !== undefined && {
          gracePeriodDays: data.gracePeriodDays,
        }),
        ...(data.bankName !== undefined && { bankName: data.bankName }),
        ...(data.accountHolder !== undefined && {
          accountHolder: data.accountHolder,
        }),
        ...(data.clabe !== undefined && { clabe: data.clabe }),
        ...(data.accountNumber !== undefined && {
          accountNumber: data.accountNumber,
        }),
        ...(data.paymentReferenceRule !== undefined && {
          paymentReferenceRule: data.paymentReferenceRule,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.notifyOnPeriodStart !== undefined && {
          notifyOnPeriodStart: data.notifyOnPeriodStart,
        }),
        ...(data.notifyDueDateReminder !== undefined && {
          notifyDueDateReminder: data.notifyDueDateReminder,
        }),
        ...(data.dueDateReminderDaysBefore !== undefined && {
          dueDateReminderDaysBefore: data.dueDateReminderDaysBefore,
        }),
        ...(data.notifyOnProofReviewed !== undefined && {
          notifyOnProofReviewed: data.notifyOnProofReviewed,
        }),
        ...(data.notificationChannel !== undefined && {
          notificationChannel: data.notificationChannel,
        }),
      },
    });

    // Sincronizar cuota y vencimiento de los cargos no liquidados del periodo actual
    if (data.defaultMonthlyFee !== undefined || data.dueDay !== undefined) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (data.defaultMonthlyFee !== undefined) {
        await this.prisma.maintenancePeriod.updateMany({
          where: {
            condominiumId,
            year: currentYear,
            month: currentMonth,
          },
          data: { amount: data.defaultMonthlyFee },
        });
      }

      const updateData: { amount?: number; dueDate?: Date } = {};
      if (data.defaultMonthlyFee !== undefined) {
        updateData.amount = data.defaultMonthlyFee;
      }
      if (data.dueDay !== undefined) {
        updateData.dueDate = new Date(
          currentYear,
          currentMonth - 1,
          data.dueDay,
          23,
          59,
          59,
        );
      }

      await this.prisma.maintenanceCharge.updateMany({
        where: {
          condominiumId,
          maintenancePeriod: {
            year: currentYear,
            month: currentMonth,
          },
          status: 'PENDING',
        },
        data: updateData,
      });
    }

    return BillingMapper.toConfigDomain(config);
  }

  async getRecordsByPeriod(
    condominiumId: string,
    params: FindBillingRecordsParams,
  ): Promise<{
    period: string;
    count: number;
    totalCollected: number;
    totalExpected: number;
    records: BillingRecordEntity[];
  }> {
    const config = await this.getConfig(condominiumId);

    // Parsear periodo (ej. "2026-09")
    let year: number;
    let month: number;
    if (params.period && params.period.includes('-')) {
      const [y, m] = params.period.split('-').map(Number);
      year = y;
      month = m;
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
    }
    const periodStr = `${year}-${String(month).padStart(2, '0')}`;

    const now = new Date();
    const isCurrentPeriod =
      year === now.getFullYear() && month === now.getMonth() + 1;

    // Buscar si el MaintenancePeriod ya existe
    const monthName = MONTH_NAMES[month - 1] || `Mes ${month}`;
    let period = await this.prisma.maintenancePeriod.findUnique({
      where: {
        condominiumId_year_month: {
          condominiumId,
          year,
          month,
        },
      },
    });

    // Si NO es el periodo actual y no existe, no inventar cargos retroactivos ni futuros
    if (!isCurrentPeriod && !period) {
      return {
        period: periodStr,
        count: 0,
        totalCollected: 0,
        totalExpected: 0,
        records: [],
      };
    }

    // Si es el periodo actual y no existe, crearlo
    if (!period) {
      period = await this.prisma.maintenancePeriod.create({
        data: {
          condominiumId,
          year,
          month,
          name: `${monthName} ${year}`,
          amount: config.defaultMonthlyFee,
        },
      });
    }

    // Obtener casas activas del condominio
    const houses = await this.prisma.house.findMany({
      where: { condominiumId, isDisabled: false },
      include: {
        residents: {
          include: { user: true },
        },
      },
      orderBy: [{ tower: 'asc' }, { houseNumber: 'asc' }],
    });

    // Asegurar que exista un MaintenanceCharge para cada casa activa del condominio
    const existingCharges = await this.prisma.maintenanceCharge.findMany({
      where: {
        condominiumId,
        maintenancePeriodId: period.id,
      },
    });
    const chargedHouseIds = new Set(existingCharges.map((c) => c.houseId));

    const missingHouses = houses.filter((h) => !chargedHouseIds.has(h.id));
    if (missingHouses.length > 0) {
      const dueDate = new Date(year, month - 1, config.dueDay, 23, 59, 59);
      await this.prisma.maintenanceCharge.createMany({
        data: missingHouses.map((h) => ({
          condominiumId,
          houseId: h.id,
          maintenancePeriodId: period.id,
          concept: `Cuota de Mantenimiento - ${monthName} ${year}`,
          amount: config.defaultMonthlyFee,
          dueDate,
          status: 'PENDING',
        })),
      });
    }

    // Si estamos en el periodo en curso, sincronizar cargos no liquidados con la cuota base vigente
    if (isCurrentPeriod) {
      await this.prisma.maintenanceCharge.updateMany({
        where: {
          condominiumId,
          maintenancePeriodId: period.id,
          status: 'PENDING',
          amount: { not: config.defaultMonthlyFee },
        },
        data: {
          amount: config.defaultMonthlyFee,
        },
      });

      await this.prisma.maintenancePeriod.updateMany({
        where: {
          id: period.id,
          amount: { not: config.defaultMonthlyFee },
        },
        data: {
          amount: config.defaultMonthlyFee,
        },
      });
    }

    // Auto-aplicar Saldo a Favor a cuotas pendientes de las viviendas que tengan crédito
    for (const h of houses) {
      await this.autoApplyCreditToHouse(h.id, condominiumId);
    }

    // Cargar todos los cargos del periodo con relaciones
    const charges = await this.prisma.maintenanceCharge.findMany({
      where: {
        condominiumId,
        maintenancePeriodId: period.id,
        house: { isDisabled: false },
      },
      include: {
        house: {
          include: {
            residents: {
              include: { user: true },
            },
            houseAccount: true,
          },
        },
        payments: {
          include: { createdBy: true },
          orderBy: { paymentDate: 'desc' },
        },
        maintenancePeriod: true,
        lateFees: true,
      },
    });

    // Mapear a entidades de dominio con cálculo dinámico de morosidad y firmas de URL frescas
    let domainRecords = await Promise.all(
      charges.map((c) => this.mapChargeToDomain(c, config)),
    );

    // Ordenamiento natural por número de vivienda a nivel backend
    domainRecords.sort((a, b) => {
      const cmp = (a.houseNumber || '').localeCompare(
        b.houseNumber || '',
        undefined,
        { numeric: true, sensitivity: 'base' },
      );
      if (cmp !== 0) return cmp;
      return (a.tower || '').localeCompare(b.tower || '', undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });

    // Filtros
    if (params.status && params.status !== 'ALL') {
      domainRecords = domainRecords.filter((r) => r.status === params.status);
    }
    if (params.tower && params.tower !== 'ALL') {
      domainRecords = domainRecords.filter((r) => r.tower === params.tower);
    }
    if (params.search && params.search.trim().length > 0) {
      const q = params.search.toLowerCase().trim();
      domainRecords = domainRecords.filter(
        (r) =>
          r.houseNumber.toLowerCase().includes(q) ||
          (r.residentName && r.residentName.toLowerCase().includes(q)) ||
          (r.residentEmail && r.residentEmail.toLowerCase().includes(q)),
      );
    }

    // Totales y KPIs
    const count = domainRecords.length;
    const totalCollected = domainRecords.reduce(
      (sum, r) => sum + (r.status === 'PAID' ? r.paidAmount : 0),
      0,
    );
    const totalExpected = domainRecords.reduce(
      (sum, r) => sum + r.totalAmount,
      0,
    );

    return {
      period: periodStr,
      count,
      totalCollected,
      totalExpected,
      records: domainRecords,
    };
  }

  private async resolveFileUrl(
    rawUrlOrKey?: string | null,
  ): Promise<string | undefined> {
    if (!rawUrlOrKey || rawUrlOrKey.trim().length === 0) {
      return undefined;
    }

    try {
      let key = rawUrlOrKey.trim();

      // Si viene con protocolo completo (ej. URL previa o simulación), extraer el pathname
      if (key.startsWith('http://') || key.startsWith('https://')) {
        const parsed = new URL(key);
        key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
      }

      // Si es una clave almacenada en el bucket privado, generar Presigned URL fresca (2 horas = 7200s)
      if (key.startsWith('condominiums/')) {
        return await this.storageService.getPresignedUrl(key, 7200);
      }

      return rawUrlOrKey;
    } catch {
      return rawUrlOrKey;
    }
  }

  private async mapChargeToDomain(
    charge: any,
    config?: BillingConfigEntity | null,
  ): Promise<BillingRecordEntity> {
    const domain = BillingMapper.toRecordDomain(charge, config);

    if (domain.residentProof?.proofUrl) {
      domain.residentProof.proofUrl =
        (await this.resolveFileUrl(domain.residentProof.proofUrl)) || '';
    }

    if (domain.receipt?.receiptUrl) {
      domain.receipt.receiptUrl =
        (await this.resolveFileUrl(domain.receipt.receiptUrl)) || '';
    }

    return domain;
  }

  /**
   * Auto-aplica el saldo a favor disponible en HouseAccount a los cargos pendientes de la vivienda.
   */
  private async autoApplyCreditToHouse(
    houseId: string,
    condominiumId: string,
  ): Promise<void> {
    const account = await this.prisma.houseAccount.findUnique({
      where: { houseId },
    });
    if (!account || Number(account.currentBalance) <= 0) return;

    let availableCredit = Number(account.currentBalance);

    const pendingCharges = await this.prisma.maintenanceCharge.findMany({
      where: {
        houseId,
        condominiumId,
        status: { in: ['PENDING', 'PARTIAL'] },
      },
      include: {
        lateFees: true,
        house: {
          include: {
            residents: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    if (pendingCharges.length === 0) return;

    const config = await this.getConfig(condominiumId);
    const adminUser = await this.prisma.user.findFirst({
      where: { condominiumId, role: 'ADMIN' },
    });

    for (const charge of pendingCharges) {
      if (availableCredit <= 0) break;

      const baseAmount = Number(charge.amount);
      const currentPaid = Number(charge.paidAmount ?? 0);

      let lateFee = 0;
      const graceDays = config.gracePeriodDays ?? 2;
      const graceLimit = new Date(charge.dueDate);
      graceLimit.setDate(graceLimit.getDate() + graceDays);
      const now = new Date();

      if (now > graceLimit && config.applyLateFee) {
        if (config.lateFeeType === 'PERCENTAGE') {
          lateFee = Math.round(baseAmount * (config.lateFeeValue / 100));
        } else {
          lateFee = Number(config.lateFeeValue);
        }
      } else if (charge.lateFees && charge.lateFees.length > 0) {
        lateFee = charge.lateFees.reduce((sum, f) => sum + Number(f.amount), 0);
      }

      const totalDue = baseAmount + lateFee;
      const remainingDue = Math.max(0, totalDue - currentPaid);
      if (remainingDue <= 0) continue;

      const amountToApply = Math.min(availableCredit, remainingDue);
      const newPaid = currentPaid + amountToApply;
      const isFullyPaid = newPaid >= totalDue;

      const folio = `REC-CREDIT-${charge.house?.houseNumber || 'H'}-${Date.now().toString().slice(-6)}`;
      const createdById =
        adminUser?.id ||
        charge.house?.residents?.[0]?.userId ||
        (await this.prisma.user.findFirst())?.id ||
        '';

      await this.prisma.$transaction(async (tx) => {
        // Descontar saldo a favor de la vivienda
        await tx.houseAccount.update({
          where: { houseId },
          data: {
            currentBalance: {
              decrement: amountToApply,
            },
          },
        });

        // Registrar movimiento contable
        await tx.accountMovement.create({
          data: {
            houseId,
            type: AccountMovementType.PAYMENT,
            description: `Aplicación de saldo a favor a cuota ${charge.concept}`,
            amount: amountToApply,
            movementDate: new Date(),
          },
        });

        // Registrar pago
        await tx.payment.create({
          data: {
            maintenanceChargeId: charge.id,
            amount: amountToApply,
            paymentDate: new Date(),
            paymentMethod: PaymentMethod.TRANSFER,
            reference: 'SALDO-A-FAVOR',
            observations: isFullyPaid
              ? 'Cuota liquidada automáticamente con Saldo a Favor'
              : `Abono parcial de $${amountToApply.toLocaleString('es-MX')} MXN aplicado desde Saldo a Favor`,
            receiptFolio: folio,
            receiptUploadedAt: new Date(),
            createdById,
          },
        });

        // Actualizar cargo
        await tx.maintenanceCharge.update({
          where: { id: charge.id },
          data: {
            paidAmount: newPaid,
            status: isFullyPaid ? 'PAID' : 'PARTIAL',
          },
        });
      });

      availableCredit -= amountToApply;
    }
  }

  async getChargeById(
    chargeId: string,
    condominiumId?: string,
  ): Promise<BillingRecordEntity | null> {
    const charge = await this.prisma.maintenanceCharge.findFirst({
      where: {
        id: chargeId,
        ...(condominiumId && { condominiumId }),
      },
      include: {
        house: {
          include: {
            residents: {
              include: { user: true },
            },
            houseAccount: true,
          },
        },
        payments: {
          include: { createdBy: true },
          orderBy: { paymentDate: 'desc' },
        },
        maintenancePeriod: true,
        lateFees: true,
      },
    });

    if (!charge) return null;
    const config = await this.getConfig(charge.condominiumId);
    return await this.mapChargeToDomain(charge, config);
  }

  async registerPayment(
    data: RegisterPaymentData,
  ): Promise<BillingRecordEntity> {
    const charge = await this.prisma.maintenanceCharge.findFirst({
      where: { id: data.chargeId, condominiumId: data.condominiumId },
      include: { house: true, lateFees: true },
    });

    if (!charge) {
      throw new NotFoundException(
        `Cargo no encontrado con ID: ${data.chargeId}`,
      );
    }

    const config = await this.getConfig(data.condominiumId);
    const baseAmount = Number(charge.amount);

    let lateFee = 0;
    const graceDays = config.gracePeriodDays ?? 2;
    const graceLimit = new Date(charge.dueDate);
    graceLimit.setDate(graceLimit.getDate() + graceDays);
    graceLimit.setHours(23, 59, 59, 999);
    const paymentEffectiveDate = data.paymentDate
      ? new Date(data.paymentDate)
      : new Date();

    if (data.waiveLateFee) {
      lateFee = 0;
    } else if (paymentEffectiveDate > graceLimit && config.applyLateFee) {
      if (config.lateFeeType === 'PERCENTAGE') {
        lateFee = Math.round(baseAmount * (config.lateFeeValue / 100));
      } else {
        lateFee = Number(config.lateFeeValue);
      }
    } else if (charge.lateFees && charge.lateFees.length > 0) {
      lateFee = charge.lateFees.reduce((sum, f) => sum + Number(f.amount), 0);
    }

    const currentPaid = Number(charge.paidAmount ?? 0);
    const totalDue = baseAmount + lateFee;
    const remainingForCharge = Math.max(0, totalDue - currentPaid);

    const paidAmount = Number(data.paidAmount);
    const amountForCharge = Math.min(paidAmount, remainingForCharge);
    const excessCredit = Math.max(0, paidAmount - remainingForCharge);
    const newPaidAmount = currentPaid + amountForCharge;
    const isChargePaid = newPaidAmount >= totalDue;

    const folio =
      data.receiptFolio ||
      `REC-${charge.house?.houseNumber || 'H'}-${Date.now().toString().slice(-6)}`;

    // Mapear método de pago a enum Prisma
    let prismaMethod: PaymentMethod = PaymentMethod.TRANSFER;
    const upperMethod = (data.paymentMethod || '').toUpperCase();
    if (upperMethod === 'CASH') prismaMethod = PaymentMethod.CASH;
    else if (upperMethod === 'CARD') prismaMethod = PaymentMethod.CARD;
    else if (upperMethod === 'CHECK') prismaMethod = PaymentMethod.CHECK;
    else if (upperMethod === 'SPEI') prismaMethod = PaymentMethod.SPEI;

    let observations = data.adminNotes || '';
    if (data.waiveLateFee) {
      const waiveNote = `[Recargo omitido: ${data.waiveReason?.trim() || 'Autorizado por administración'}]`;
      observations = observations
        ? `${observations} | ${waiveNote}`
        : waiveNote;
    }
    if (excessCredit > 0) {
      const noteExcess = `Total recibido: $${paidAmount.toLocaleString('es-MX')} MXN ($${amountForCharge.toLocaleString('es-MX')} aplicados a esta cuota, $${excessCredit.toLocaleString('es-MX')} acreditados a Saldo a Favor)`;
      observations = observations
        ? `${observations} | ${noteExcess}`
        : noteExcess;
    }

    await this.prisma.$transaction(async (tx) => {
      // Si se condonó/omitió el recargo, eliminar posibles registros previos de LateFee vinculados al cargo
      if (data.waiveLateFee) {
        await tx.lateFee.deleteMany({
          where: { maintenanceChargeId: data.chargeId },
        });
      }

      // 1. Crear registro en Payment
      await tx.payment.create({
        data: {
          maintenanceChargeId: data.chargeId,
          amount: paidAmount,
          paymentDate: data.paymentDate,
          paymentMethod: prismaMethod,
          reference: data.transactionReference,
          observations,
          receiptUrl: data.receiptUrl,
          receiptFileName: data.receiptFileName,
          receiptFolio: folio,
          receiptUploadedAt: new Date(),
          createdById: data.userId,
        },
      });

      // 2. Actualizar MaintenanceCharge
      const updatedNotes =
        charge.notes && observations
          ? `${charge.notes} | ${observations}`
          : observations || charge.notes;

      await tx.maintenanceCharge.update({
        where: { id: data.chargeId },
        data: {
          paidAmount: newPaidAmount,
          status: isChargePaid ? 'PAID' : 'PARTIAL',
          notes: updatedNotes,
        },
      });

      // 3. Si hay excedente, acreditar a la cuenta de la vivienda
      if (excessCredit > 0) {
        await tx.houseAccount.upsert({
          where: { houseId: charge.houseId },
          create: {
            houseId: charge.houseId,
            currentBalance: excessCredit,
          },
          update: {
            currentBalance: {
              increment: excessCredit,
            },
          },
        });

        await tx.accountMovement.create({
          data: {
            houseId: charge.houseId,
            type: AccountMovementType.CREDIT,
            description: `Saldo a favor por excedente de pago en cuota ${charge.concept}`,
            amount: excessCredit,
            movementDate: new Date(),
          },
        });
      }
    });

    // 4. Si hubo excedente acreditado, auto-aplicar a otras cuotas pendientes de la casa si existen
    if (excessCredit > 0) {
      await this.autoApplyCreditToHouse(charge.houseId, data.condominiumId);
    }

    const updated = await this.getChargeById(data.chargeId, data.condominiumId);
    return updated!;
  }

  async uploadResidentProof(
    data: UploadResidentProofData,
  ): Promise<BillingRecordEntity> {
    const charge = await this.prisma.maintenanceCharge.findFirst({
      where: { id: data.chargeId, condominiumId: data.condominiumId },
    });

    if (!charge) {
      throw new NotFoundException(
        `Cargo no encontrado con ID: ${data.chargeId}`,
      );
    }

    await this.prisma.maintenanceCharge.update({
      where: { id: data.chargeId },
      data: {
        proofUrl: data.proofUrl,
        proofFileName: data.proofFileName,
        proofReference: data.transactionReference,
        proofNotes: data.notes,
        proofUploadedAt: new Date(),
        status: 'IN_REVIEW',
      },
    });

    const updated = await this.getChargeById(data.chargeId, data.condominiumId);
    return updated!;
  }

  async reviewResidentProof(
    data: ReviewResidentProofData,
  ): Promise<BillingRecordEntity> {
    const charge = await this.prisma.maintenanceCharge.findFirst({
      where: { id: data.chargeId, condominiumId: data.condominiumId },
      include: { house: true },
    });

    if (!charge) {
      throw new NotFoundException(
        `Cargo no encontrado con ID: ${data.chargeId}`,
      );
    }

    const config = await this.getConfig(data.condominiumId);

    if (data.action === 'APPROVE') {
      const folio =
        data.receiptFolio?.trim() ||
        `REC-${charge.house?.houseNumber || 'H'}-${Date.now().toString().slice(-6)}`;
      const baseAmount = Number(charge.amount);

      // Calcular recargo si el comprobante fue extemporáneo a los días de gracia
      let lateFee = 0;
      const graceDays = config.gracePeriodDays ?? 2;
      const graceLimit = new Date(charge.dueDate);
      graceLimit.setDate(graceLimit.getDate() + graceDays);
      const paymentEffectiveDate = charge.proofUploadedAt || new Date();

      if (paymentEffectiveDate > graceLimit && config.applyLateFee) {
        if (config.lateFeeType === 'PERCENTAGE') {
          lateFee = Math.round(baseAmount * (config.lateFeeValue / 100));
        } else {
          lateFee = Number(config.lateFeeValue);
        }
      }

      const amountToPay = baseAmount + lateFee;

      await this.prisma.$transaction(async (tx) => {
        await tx.payment.create({
          data: {
            maintenanceChargeId: data.chargeId,
            amount: amountToPay,
            paymentDate: paymentEffectiveDate,
            paymentMethod: PaymentMethod.TRANSFER,
            reference: data.reference || charge.proofReference,
            observations: 'Comprobante aprobado por administración',
            receiptFolio: folio,
            receiptUrl: data.receiptUrl,
            receiptFileName: data.receiptFileName,
            receiptUploadedAt: new Date(),
            createdById: data.userId,
          },
        });

        await tx.maintenanceCharge.update({
          where: { id: data.chargeId },
          data: {
            paidAmount: amountToPay,
            status: 'PAID',
          },
        });
      });

      // Si la vivienda tiene saldo a favor acumulado, aplicarlo a otros cargos pendientes
      await this.autoApplyCreditToHouse(charge.houseId, data.condominiumId);

      // Notificar al residente aprobación y emisión de recibo en segundo plano
      this.notificationService
        .notifyProofReviewed({
          condominiumId: data.condominiumId,
          chargeId: data.chargeId,
          action: 'APPROVE',
          receiptFolio: folio,
        })
        .catch(() => {});
    } else {
      // REJECT
      const rejectNote = `Comprobante rechazado: ${data.rejectReason || 'No coincide con estado de cuenta'}`;
      await this.prisma.maintenanceCharge.update({
        where: { id: data.chargeId },
        data: {
          status: 'PENDING',
          proofNotes: charge.proofNotes
            ? `${charge.proofNotes} | ${rejectNote}`
            : rejectNote,
        },
      });

      // Notificar al residente motivo del rechazo en segundo plano
      this.notificationService
        .notifyProofReviewed({
          condominiumId: data.condominiumId,
          chargeId: data.chargeId,
          action: 'REJECT',
          rejectReason: data.rejectReason,
        })
        .catch(() => {});
    }

    const updated = await this.getChargeById(data.chargeId, data.condominiumId);
    return updated!;
  }

  async getMyBillingRecords(
    userId: string,
    condominiumId: string,
  ): Promise<{
    houseId?: string;
    houseNumber?: string;
    creditBalance?: number;
    currentRecord: BillingRecordEntity | null;
    historyRecords: BillingRecordEntity[];
  }> {
    const resident = await this.prisma.residentProfile.findFirst({
      where: { userId, condominiumId },
      include: { house: true },
    });

    let houseId = resident?.houseId;
    let houseNumber = resident?.house?.houseNumber;

    if (!houseId) {
      // Si el usuario no tiene perfil de residente (ej. ADMIN probando la interfaz de residente),
      // buscar la primera vivienda activa del condominio para previsualizar
      const firstHouse = await this.prisma.house.findFirst({
        where: { condominiumId, isDisabled: false },
        orderBy: [{ tower: 'asc' }, { houseNumber: 'asc' }],
      });
      if (firstHouse) {
        houseId = firstHouse.id;
        houseNumber = firstHouse.houseNumber;
      }
    }

    if (!houseId) {
      return { currentRecord: null, historyRecords: [] };
    }

    const config = await this.getConfig(condominiumId);

    // Asegurar que el periodo actual y el cargo de mantenimiento para esta casa existan
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const monthName = MONTH_NAMES[currentMonth - 1] || `Mes ${currentMonth}`;

    const currentPeriod = await this.prisma.maintenancePeriod.upsert({
      where: {
        condominiumId_year_month: {
          condominiumId,
          year: currentYear,
          month: currentMonth,
        },
      },
      create: {
        condominiumId,
        year: currentYear,
        month: currentMonth,
        name: `${monthName} ${currentYear}`,
        amount: config.defaultMonthlyFee,
      },
      update: {},
    });

    const existingCurrentCharge = await this.prisma.maintenanceCharge.findFirst(
      {
        where: {
          condominiumId,
          houseId,
          maintenancePeriodId: currentPeriod.id,
        },
      },
    );

    if (!existingCurrentCharge) {
      const dueDate = new Date(
        currentYear,
        currentMonth - 1,
        config.dueDay,
        23,
        59,
        59,
      );
      await this.prisma.maintenanceCharge.create({
        data: {
          condominiumId,
          houseId,
          maintenancePeriodId: currentPeriod.id,
          concept: `Cuota de Mantenimiento - ${monthName} ${currentYear}`,
          amount: config.defaultMonthlyFee,
          dueDate,
          status: 'PENDING',
        },
      });
    }

    // Auto-aplicar Saldo a Favor si la vivienda cuenta con crédito disponible
    await this.autoApplyCreditToHouse(houseId, condominiumId);

    const charges = await this.prisma.maintenanceCharge.findMany({
      where: {
        condominiumId,
        houseId,
      },
      include: {
        house: {
          include: {
            residents: {
              include: { user: true },
            },
            houseAccount: true,
          },
        },
        payments: {
          include: { createdBy: true },
          orderBy: { paymentDate: 'desc' },
        },
        maintenancePeriod: true,
        lateFees: true,
      },
      orderBy: { dueDate: 'desc' },
    });

    const domainRecords = await Promise.all(
      charges.map((c) => this.mapChargeToDomain(c, config)),
    );

    const currentPeriodStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const currentRecord =
      domainRecords.find((r) => r.period === currentPeriodStr) ||
      (domainRecords.length > 0 ? domainRecords[0] : null);

    const historyRecords = currentRecord
      ? domainRecords.filter((r) => r.id !== currentRecord.id)
      : domainRecords;

    const finalAccount = await this.prisma.houseAccount.findUnique({
      where: { houseId },
    });
    const creditBalance = finalAccount
      ? Math.max(0, Number(finalAccount.currentBalance))
      : 0;

    return {
      houseId,
      houseNumber,
      creditBalance,
      currentRecord,
      historyRecords,
    };
  }
}
