export class RegisterPaymentCommand {
  recordId: string;
  condominiumId: string;
  userId: string;
  paidAmount: number;
  paymentDate: Date;
  paymentMethod: string;
  transactionReference?: string;
  adminNotes?: string;
  generateDigitalReceipt?: boolean;
  receiptUrl?: string;
  receiptFileName?: string;
  receiptFolio?: string;
  waiveLateFee?: boolean;
  waiveReason?: string;
}
