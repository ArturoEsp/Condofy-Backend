export type LateFeeTypeDomain = 'PERCENTAGE' | 'FIXED';
export type NotificationChannelDomain = 'ALL' | 'PUSH' | 'EMAIL';

export class BillingConfigEntity {
  id: string;
  condominiumId: string;
  defaultMonthlyFee: number;
  currency: string;
  dueDay: number;
  applyLateFee: boolean;
  lateFeeType: LateFeeTypeDomain;
  lateFeeValue: number;
  gracePeriodDays: number;
  bankName?: string | null;
  accountHolder?: string | null;
  clabe?: string | null;
  accountNumber?: string | null;
  paymentReferenceRule?: string | null;
  notes?: string | null;
  notifyOnPeriodStart: boolean;
  notifyDueDateReminder: boolean;
  dueDateReminderDaysBefore: number;
  notifyOnProofReviewed: boolean;
  notificationChannel: string;
  initialBalance?: number;
  initialReserveFund?: number;
  initialBalanceDate?: Date | null;
  initialBalanceNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
