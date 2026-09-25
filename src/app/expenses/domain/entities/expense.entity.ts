export type ExpenseCategoryDomain =
  | 'SERVICES'
  | 'MAINTENANCE'
  | 'SECURITY'
  | 'CLEANING'
  | 'GARDENING'
  | 'ADMINISTRATION'
  | 'RESERVE_FUND'
  | 'OTHER';

export type ExpenseStatusDomain = 'PAID' | 'PENDING' | 'CANCELLED';

export class ExpenseEntity {
  id: string;
  condominiumId: string;
  concept: string;
  description?: string | null;
  amount: number;
  expenseDate: Date;
  period: string; // YYYY-MM
  category: ExpenseCategoryDomain;
  paymentMethod: string;
  status: ExpenseStatusDomain;
  supplier?: string | null;
  reference?: string | null;
  invoiceUrl?: string | null;
  invoiceFileName?: string | null;
  invoiceFileType?: string | null;
  createdById: string;
  createdByName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
