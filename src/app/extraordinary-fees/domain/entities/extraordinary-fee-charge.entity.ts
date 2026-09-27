export type ExtraordinaryFeeChargeStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'PARTIAL'
  | 'PAID'
  | 'CANCELLED';

export class ExtraordinaryFeeChargeEntity {
  id: string;
  extraordinaryFeeId: string;
  houseId: string;
  houseNumber: string;
  tower?: string | null;
  residentName?: string | null;
  residentEmail?: string | null;
  residentPhone?: string | null;
  amount: number;
  paidAmount: number;
  status: ExtraordinaryFeeChargeStatus;
  paymentDate?: Date | null;
  paymentMethod?: string | null;
  reference?: string | null;
  notes?: string | null;
  proofUrl?: string | null;
  proofFileName?: string | null;
  proofUploadedAt?: Date | null;
  receiptFolio?: string | null;
  receiptUrl?: string | null;
  receiptUploadedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
