export class UpdateBillingConfigCommand {
  defaultMonthlyFee?: number;
  currency?: string;
  dueDay?: number;
  applyLateFee?: boolean;
  lateFeeType?: 'PERCENTAGE' | 'FIXED';
  lateFeeValue?: number;
  gracePeriodDays?: number;
  bankName?: string | null;
  accountHolder?: string | null;
  clabe?: string | null;
  accountNumber?: string | null;
  paymentReferenceRule?: string | null;
  notes?: string | null;
}
