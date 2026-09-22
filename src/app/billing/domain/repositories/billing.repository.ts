import { BillingConfigEntity } from '../entities/billing-config.entity';
import { BillingRecordEntity } from '../entities/billing-record.entity';

export interface UpsertBillingConfigData {
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
  notifyOnPeriodStart?: boolean;
  notifyDueDateReminder?: boolean;
  dueDateReminderDaysBefore?: number;
  notifyOnProofReviewed?: boolean;
  notificationChannel?: string;
}

export interface FindBillingRecordsParams {
  period?: string; // YYYY-MM
  status?: string;
  tower?: string;
  search?: string;
}

export interface RegisterPaymentData {
  chargeId: string;
  condominiumId: string;
  userId: string;
  paidAmount: number;
  paymentDate: Date;
  paymentMethod: string;
  transactionReference?: string;
  adminNotes?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  receiptFolio?: string;
}

export interface UploadResidentProofData {
  chargeId: string;
  condominiumId: string;
  proofUrl: string;
  proofFileName?: string;
  transactionReference?: string;
  notes?: string;
}

export interface ReviewResidentProofData {
  chargeId: string;
  condominiumId: string;
  userId: string;
  action: 'APPROVE' | 'REJECT';
  reference?: string;
  rejectReason?: string;
}

export default interface BillingRepository {
  getConfig(condominiumId: string): Promise<BillingConfigEntity>;
  upsertConfig(
    condominiumId: string,
    data: UpsertBillingConfigData,
  ): Promise<BillingConfigEntity>;
  getRecordsByPeriod(
    condominiumId: string,
    params: FindBillingRecordsParams,
  ): Promise<{
    period: string;
    count: number;
    totalCollected: number;
    totalExpected: number;
    records: BillingRecordEntity[];
  }>;
  getChargeById(
    chargeId: string,
    condominiumId?: string,
  ): Promise<BillingRecordEntity | null>;
  registerPayment(data: RegisterPaymentData): Promise<BillingRecordEntity>;
  uploadResidentProof(
    data: UploadResidentProofData,
  ): Promise<BillingRecordEntity>;
  reviewResidentProof(
    data: ReviewResidentProofData,
  ): Promise<BillingRecordEntity>;
  getMyBillingRecords(
    userId: string,
    condominiumId: string,
  ): Promise<{
    currentRecord: BillingRecordEntity | null;
    historyRecords: BillingRecordEntity[];
  }>;
}
