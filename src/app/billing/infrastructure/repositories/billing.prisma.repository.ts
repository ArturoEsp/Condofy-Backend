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
import { PaymentMethod } from '@/core/infrastructure/persistence/prisma/generated/client';

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

    // Buscar o autogenerar MaintenancePeriod
    const monthName = MONTH_NAMES[month - 1] || `Mes ${month}`;
    const period = await this.prisma.maintenancePeriod.upsert({
      where: {
        condominiumId_year_month: {
          condominiumId,
          year,
          month,
        },
      },
      create: {
        condominiumId,
        year,
        month,
        name: `${monthName} ${year}`,
        amount: config.defaultMonthlyFee,
      },
      update: {},
    });

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

    // Asegurar que exista un MaintenanceCharge para cada casa en este periodo
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
    const now = new Date();
    const isCurrentPeriod =
      year === now.getFullYear() && month === now.getMonth() + 1;
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

    // Cargar todos los cargos del periodo con relaciones
    const charges = await this.prisma.maintenanceCharge.findMany({
      where: {
        condominiumId,
        maintenancePeriodId: period.id,
      },
      include: {
        house: {
          include: {
            residents: {
              include: { user: true },
            },
          },
        },
        payments: {
          include: { createdBy: true },
          orderBy: { paymentDate: 'desc' },
        },
        maintenancePeriod: true,
        lateFees: true,
      },
      orderBy: [{ house: { tower: 'asc' } }, { house: { houseNumber: 'asc' } }],
    });

    // Mapear a entidades de dominio con cálculo dinámico de morosidad y firmas de URL frescas
    let domainRecords = await Promise.all(
      charges.map((c) => this.mapChargeToDomain(c, config)),
    );

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
      include: { house: true },
    });

    if (!charge) {
      throw new NotFoundException(
        `Cargo no encontrado con ID: ${data.chargeId}`,
      );
    }

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

    await this.prisma.$transaction(async (tx) => {
      // 1. Crear registro en Payment
      await tx.payment.create({
        data: {
          maintenanceChargeId: data.chargeId,
          amount: data.paidAmount,
          paymentDate: data.paymentDate,
          paymentMethod: prismaMethod,
          reference: data.transactionReference,
          observations: data.adminNotes,
          receiptUrl: data.receiptUrl,
          receiptFileName: data.receiptFileName,
          receiptFolio: folio,
          receiptUploadedAt: new Date(),
          createdById: data.userId,
        },
      });

      // 2. Actualizar MaintenanceCharge a PAID
      await tx.maintenanceCharge.update({
        where: { id: data.chargeId },
        data: {
          paidAmount: data.paidAmount,
          status: 'PAID',
          notes: data.adminNotes,
        },
      });

      // 3. Actualizar cuenta de la casa si existe
      const account = await tx.houseAccount.findUnique({
        where: { houseId: charge.houseId },
      });
      if (account) {
        await tx.houseAccount.update({
          where: { houseId: charge.houseId },
          data: {
            currentBalance: {
              decrement: data.paidAmount,
            },
          },
        });
      }
    });

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
      const folio = `REC-${charge.house?.houseNumber || 'H'}-${Date.now().toString().slice(-6)}`;
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

        // Actualizar saldo de la cuenta de la vivienda si existe
        const account = await tx.houseAccount.findUnique({
          where: { houseId: charge.houseId },
        });
        if (account) {
          await tx.houseAccount.update({
            where: { houseId: charge.houseId },
            data: {
              currentBalance: {
                decrement: amountToPay,
              },
            },
          });
        }
      });

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
    currentRecord: BillingRecordEntity | null;
    historyRecords: BillingRecordEntity[];
  }> {
    const resident = await this.prisma.residentProfile.findFirst({
      where: { userId, condominiumId },
      include: { house: true },
    });

    if (!resident || !resident.houseId) {
      return { currentRecord: null, historyRecords: [] };
    }

    const config = await this.getConfig(condominiumId);

    const charges = await this.prisma.maintenanceCharge.findMany({
      where: {
        condominiumId,
        houseId: resident.houseId,
      },
      include: {
        house: {
          include: {
            residents: {
              include: { user: true },
            },
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

    return {
      currentRecord: domainRecords.length > 0 ? domainRecords[0] : null,
      historyRecords: domainRecords,
    };
  }
}
