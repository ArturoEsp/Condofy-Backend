import { Prisma } from '@/core/infrastructure/persistence/prisma/generated/client';
import {
  BillingConfigEntity,
  LateFeeTypeDomain,
} from '../../domain/entities/billing-config.entity';
import {
  BillingPaymentStatus,
  BillingRecordEntity,
} from '../../domain/entities/billing-record.entity';

export interface PrismaBillingConfigRecord {
  id: string;
  condominiumId: string;
  defaultMonthlyFee: number | string | Prisma.Decimal;
  currency: string;
  dueDay: number;
  applyLateFee: boolean;
  lateFeeType: string;
  lateFeeValue: number | string | Prisma.Decimal;
  gracePeriodDays: number;
  bankName?: string | null;
  accountHolder?: string | null;
  clabe?: string | null;
  accountNumber?: string | null;
  paymentReferenceRule?: string | null;
  notes?: string | null;
  notifyOnPeriodStart?: boolean | null;
  notifyDueDateReminder?: boolean | null;
  dueDateReminderDaysBefore?: number | null;
  notifyOnProofReviewed?: boolean | null;
  notificationChannel?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrismaPaymentUserRecord {
  firstName?: string | null;
  lastName?: string | null;
}

export interface PrismaPaymentItemRecord {
  id: string;
  paymentDate: Date;
  amount: number | string | Prisma.Decimal;
  paymentMethod?: string | null;
  reference?: string | null;
  receiptFolio?: string | null;
  receiptUrl?: string | null;
  receiptFileName?: string | null;
  receiptUploadedAt?: Date | null;
  createdAt: Date;
  createdBy?: PrismaPaymentUserRecord | null;
}

export interface PrismaLateFeeItemRecord {
  id: string;
  amount: number | string | Prisma.Decimal;
}

export interface PrismaResidentProfileRecord {
  firstName: string;
  lastName: string;
  user?: {
    email: string;
  } | null;
}

export interface PrismaHouseItemRecord {
  id: string;
  houseNumber: string;
  tower?: string | null;
  residents?: PrismaResidentProfileRecord[];
}

export interface PrismaMaintenancePeriodRecord {
  year: number;
  month: number;
}

export interface PrismaMaintenanceChargeRecord {
  id: string;
  houseId: string;
  concept: string;
  amount: number | string | Prisma.Decimal;
  paidAmount?: number | string | Prisma.Decimal | null;
  dueDate: Date;
  status: string;
  proofUrl?: string | null;
  proofFileName?: string | null;
  proofUploadedAt?: Date | null;
  proofReference?: string | null;
  proofNotes?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  house?: PrismaHouseItemRecord | null;
  payments?: PrismaPaymentItemRecord[];
  lateFees?: PrismaLateFeeItemRecord[];
  maintenancePeriod?: PrismaMaintenancePeriodRecord | null;
}

export class BillingMapper {
  static toConfigDomain(
    raw?: PrismaBillingConfigRecord | null,
  ): BillingConfigEntity {
    if (!raw) {
      return {
        id: '',
        condominiumId: '',
        defaultMonthlyFee: 1500,
        currency: 'MXN',
        dueDay: 10,
        applyLateFee: true,
        lateFeeType: 'PERCENTAGE',
        lateFeeValue: 10,
        gracePeriodDays: 2,
        bankName: null,
        accountHolder: null,
        clabe: null,
        accountNumber: null,
        paymentReferenceRule: null,
        notes: null,
        notifyOnPeriodStart: true,
        notifyDueDateReminder: true,
        dueDateReminderDaysBefore: 3,
        notifyOnProofReviewed: true,
        notificationChannel: 'ALL',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return {
      id: raw.id,
      condominiumId: raw.condominiumId,
      defaultMonthlyFee: Number(raw.defaultMonthlyFee),
      currency: raw.currency,
      dueDay: raw.dueDay,
      applyLateFee: raw.applyLateFee,
      lateFeeType: (raw.lateFeeType as LateFeeTypeDomain) || 'PERCENTAGE',
      lateFeeValue: Number(raw.lateFeeValue),
      gracePeriodDays: raw.gracePeriodDays,
      bankName: raw.bankName ?? null,
      accountHolder: raw.accountHolder ?? null,
      clabe: raw.clabe ?? null,
      accountNumber: raw.accountNumber ?? null,
      paymentReferenceRule: raw.paymentReferenceRule ?? null,
      notes: raw.notes ?? null,
      notifyOnPeriodStart: raw.notifyOnPeriodStart ?? true,
      notifyDueDateReminder: raw.notifyDueDateReminder ?? true,
      dueDateReminderDaysBefore: raw.dueDateReminderDaysBefore ?? 3,
      notifyOnProofReviewed: raw.notifyOnProofReviewed ?? true,
      notificationChannel: raw.notificationChannel ?? 'ALL',
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toRecordDomain(
    charge: PrismaMaintenanceChargeRecord,
    config?: BillingConfigEntity | null,
  ): BillingRecordEntity {
    const baseAmount = Number(charge.amount);
    const paidAmount = Number(charge.paidAmount ?? 0);
    const dueDate = new Date(charge.dueDate);
    const now = new Date();

    // Calcular días de tolerancia para mora
    const graceDays = config?.gracePeriodDays ?? 2;
    const graceLimit = new Date(dueDate);
    graceLimit.setDate(graceLimit.getDate() + graceDays);

    let status: BillingPaymentStatus = 'PENDING';
    if (charge.status === 'PAID') {
      status = 'PAID';
    } else if (charge.status === 'IN_REVIEW') {
      status = 'IN_REVIEW';
    } else if (charge.status === 'PARTIAL') {
      status = 'PARTIAL';
    } else if (now > graceLimit) {
      status = 'OVERDUE';
    } else {
      status = 'PENDING';
    }

    // Calcular recargo por mora
    let lateFeeAmount = 0;
    if (status === 'OVERDUE' && config?.applyLateFee) {
      if (config.lateFeeType === 'PERCENTAGE') {
        lateFeeAmount = Math.round(baseAmount * (config.lateFeeValue / 100));
      } else {
        lateFeeAmount = config.lateFeeValue;
      }
    } else if (charge.lateFees && charge.lateFees.length > 0) {
      lateFeeAmount = charge.lateFees.reduce(
        (sum: number, fee: PrismaLateFeeItemRecord) => sum + Number(fee.amount),
        0,
      );
    }

    const totalAmount =
      status === 'PAID' ? paidAmount : baseAmount + lateFeeAmount;

    // Residente principal de la casa
    const residentProfile = charge.house?.residents?.[0];
    const residentUser = residentProfile?.user;
    const residentName = residentProfile
      ? `${residentProfile.firstName} ${residentProfile.lastName}`.trim()
      : undefined;
    const residentEmail = residentUser?.email ?? undefined;

    // Último pago registrado
    const latestPayment =
      charge.payments && charge.payments.length > 0
        ? charge.payments[charge.payments.length - 1]
        : null;

    // Recibo
    const receipt =
      latestPayment?.receiptUrl || latestPayment?.receiptFolio
        ? {
            receiptUrl: latestPayment.receiptUrl ?? '',
            fileName: latestPayment.receiptFileName ?? 'Recibo_Oficial.pdf',
            folio:
              latestPayment.receiptFolio ??
              `REC-${charge.id.slice(0, 8).toUpperCase()}`,
            uploadedAt:
              latestPayment.receiptUploadedAt ?? latestPayment.createdAt,
            uploadedBy: latestPayment.createdBy
              ? `${latestPayment.createdBy.firstName ?? ''} ${latestPayment.createdBy.lastName ?? ''}`.trim()
              : undefined,
          }
        : null;

    // Comprobante de residente
    const residentProof = charge.proofUrl
      ? {
          proofUrl: charge.proofUrl,
          fileName: charge.proofFileName ?? 'comprobante.pdf',
          uploadedAt: charge.proofUploadedAt ?? charge.updatedAt,
          reference: charge.proofReference ?? undefined,
          notes: charge.proofNotes ?? undefined,
        }
      : null;

    const periodYear = charge.maintenancePeriod?.year ?? dueDate.getFullYear();
    const periodMonth =
      charge.maintenancePeriod?.month ?? dueDate.getMonth() + 1;
    const periodFormatted = `${periodYear}-${String(periodMonth).padStart(2, '0')}`;

    return {
      id: charge.id,
      houseId: charge.houseId,
      houseNumber: charge.house?.houseNumber ?? '',
      tower: charge.house?.tower ?? undefined,
      residentName,
      residentEmail,
      period: periodFormatted,
      concept: charge.concept,
      baseAmount,
      lateFeeAmount,
      totalAmount,
      status,
      dueDate,
      paidDate: latestPayment?.paymentDate ?? null,
      paidAmount,
      paymentMethod: latestPayment?.paymentMethod ?? null,
      transactionReference:
        latestPayment?.reference ?? charge.proofReference ?? null,
      receipt,
      residentProof,
      notes: charge.notes ?? null,
      createdAt: charge.createdAt,
      updatedAt: charge.updatedAt,
    };
  }
}
