export type BillingPaymentStatus =
  | 'PAID'
  | 'PENDING'
  | 'OVERDUE'
  | 'IN_REVIEW'
  | 'PARTIAL';

export class PaymentReceiptEntity {
  receiptUrl: string;
  fileName?: string;
  folio?: string;
  uploadedAt: Date;
  uploadedBy?: string;
}

export class ResidentProofEntity {
  proofUrl: string;
  fileName?: string;
  uploadedAt: Date;
  reference?: string;
  notes?: string;
}

export class BillingRecordEntity {
  id: string;
  houseId: string;
  houseNumber: string;
  tower?: string;
  residentName?: string;
  residentEmail?: string;
  period: string; // YYYY-MM
  concept: string;
  baseAmount: number;
  lateFeeAmount: number;
  totalAmount: number;
  status: BillingPaymentStatus;
  dueDate: Date;
  paidDate?: Date | null;
  paidAmount: number;
  paymentMethod?: string | null;
  transactionReference?: string | null;
  receipt?: PaymentReceiptEntity | null;
  residentProof?: ResidentProofEntity | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
