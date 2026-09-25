export class UpdateExpenseCommand {
  id: string;
  condominiumId: string;
  concept?: string;
  description?: string;
  amount?: number;
  expenseDate?: Date;
  period?: string;
  category?: string;
  paymentMethod?: string;
  status?: string;
  supplier?: string;
  reference?: string;
  invoiceUrl?: string;
  invoiceFileName?: string;
  invoiceFileType?: string;
}
