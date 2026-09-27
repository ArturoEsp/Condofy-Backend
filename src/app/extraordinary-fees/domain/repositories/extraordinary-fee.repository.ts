import {
  ExtraordinaryFeeEntity,
  ExtraordinaryFeeStatusType,
} from '../entities/extraordinary-fee.entity';
import { ExtraordinaryFeeChargeEntity } from '../entities/extraordinary-fee-charge.entity';

export interface CreateFeeDocumentData {
  title: string;
  fileName: string;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: string | null;
}

export interface CreateExtraordinaryFeeData {
  condominiumId: string;
  createdById: string;
  title: string;
  description: string;
  amountPerHouse: number;
  totalTargetAmount?: number;
  dueDate: Date;
  useCustomBankAccount?: boolean;
  bankName?: string;
  accountHolder?: string;
  clabe?: string;
  accountNumber?: string;
  paymentReferenceRule?: string;
  documents?: CreateFeeDocumentData[];
}

export interface RegisterExtraordinaryFeePaymentData {
  chargeId: string;
  condominiumId: string;
  userId: string;
  paidAmount: number;
  paymentDate: Date;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  receiptFolio?: string;
}

export interface UploadExtraordinaryFeeProofData {
  chargeId: string;
  condominiumId: string;
  proofUrl: string;
  proofFileName?: string;
  reference?: string;
  notes?: string;
}

export interface ReviewExtraordinaryFeeProofData {
  chargeId: string;
  condominiumId: string;
  userId: string;
  action: 'APPROVE' | 'REJECT';
  reference?: string;
  rejectReason?: string;
  receiptFolio?: string;
  receiptUrl?: string;
  receiptFileName?: string;
}

export default interface ExtraordinaryFeeRepository {
  create(data: CreateExtraordinaryFeeData): Promise<ExtraordinaryFeeEntity>;
  findAll(
    condominiumId: string,
    status?: string,
  ): Promise<ExtraordinaryFeeEntity[]>;
  findById(
    id: string,
    condominiumId: string,
  ): Promise<ExtraordinaryFeeEntity | null>;
  updateStatus(
    id: string,
    condominiumId: string,
    status: ExtraordinaryFeeStatusType,
  ): Promise<ExtraordinaryFeeEntity>;
  delete(id: string, condominiumId: string): Promise<ExtraordinaryFeeEntity>;
  registerPayment(
    data: RegisterExtraordinaryFeePaymentData,
  ): Promise<ExtraordinaryFeeChargeEntity>;
  uploadResidentProof(
    data: UploadExtraordinaryFeeProofData,
  ): Promise<ExtraordinaryFeeChargeEntity>;
  reviewResidentProof(
    data: ReviewExtraordinaryFeeProofData,
  ): Promise<ExtraordinaryFeeChargeEntity>;
  getMyCharges(
    userId: string,
    condominiumId: string,
  ): Promise<ExtraordinaryFeeEntity[]>;
}
