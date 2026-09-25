import { BillingConfigEntity } from '../entities/billing-config.entity';
import { BillingRecordEntity } from '../entities/billing-record.entity';
import { ExtraIncomeEntity } from '../entities/extra-income.entity';

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
  initialBalance?: number;
  initialReserveFund?: number;
  initialBalanceDate?: Date | null;
  initialBalanceNotes?: string | null;
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
  waiveLateFee?: boolean;
  waiveReason?: string;
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
  receiptUrl?: string;
  receiptFileName?: string;
  receiptFolio?: string;
}

export interface CreateExtraIncomeData {
  condominiumId: string;
  houseId?: string | null;
  concept: string;
  description?: string;
  amount: number;
  incomeDate: Date;
  period?: string;
  category: string;
  paymentMethod: string;
  reference?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  receiptFileType?: string;
  createdById: string;
}

export interface FindExtraIncomeParams {
  period?: string;
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  houseId?: string;
  page?: number;
  limit?: number;
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
    houseId?: string;
    houseNumber?: string;
    creditBalance?: number;
    currentRecord: BillingRecordEntity | null;
    historyRecords: BillingRecordEntity[];
  }>;
  createExtraIncome(data: CreateExtraIncomeData): Promise<ExtraIncomeEntity>;
  getExtraIncomes(
    condominiumId: string,
    params: FindExtraIncomeParams,
  ): Promise<ExtraIncomeEntity[]>;
  deleteExtraIncome(
    id: string,
    condominiumId: string,
  ): Promise<ExtraIncomeEntity>;
}
