import { ExpenseEntity } from '../entities/expense.entity';

export interface CreateExpenseData {
  condominiumId: string;
  concept: string;
  description?: string;
  amount: number;
  expenseDate: Date;
  period?: string;
  category: string;
  paymentMethod: string;
  status?: string;
  supplier?: string;
  reference?: string;
  invoiceUrl?: string;
  invoiceFileName?: string;
  invoiceFileType?: string;
  createdById: string;
}

export interface UpdateExpenseData {
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

export interface FindExpensesParams {
  period?: string;
  category?: string;
  status?: string;
  search?: string;
}

export interface ExpensesSummary {
  period: string;
  totalExpenses: number;
  paidAmount: number;
  pendingAmount: number;
  paidCount: number;
  pendingCount: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
}

export interface UpdateTransparencyConfigData {
  isEnabled?: boolean;
  showExpenses?: boolean;
  showIncomes?: boolean;
  showBalance?: boolean;
  showSuppliers?: boolean;
  showInvoices?: boolean;
  showDetailedReceipts?: boolean;
  allowInvoiceViewing?: boolean;
  allowInvoiceDownload?: boolean;
  showCollectionSummary?: boolean;
  showCollectionRate?: boolean;
  timeframeMode?: string;
  condominiumNotice?: string | null;
}

export interface TransparencyReport {
  config: {
    isEnabled: boolean;
    showExpenses: boolean;
    showIncomes: boolean;
    showBalance: boolean;
    showSuppliers: boolean;
    showInvoices: boolean;
    showDetailedReceipts: boolean;
  };
  period: string;
  summary: {
    initialBalance: number;
    initialReserveFund: number;
    periodMaintenanceIncome: number;
    periodExtraIncome: number;
    totalPeriodIncome: number;
    totalPeriodExpenses: number;
    periodNetCashFlow: number;
    currentAvailableBalance: number;
  };
  expensesBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  expenses: {
    id: string;
    concept: string;
    amount: number;
    category: string;
    expenseDate: string;
    paymentMethod: string;
    supplier?: string | null;
    invoiceUrl?: string | null;
    invoiceFileName?: string | null;
  }[];
  incomesBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  extraIncomes: {
    id: string;
    concept: string;
    amount: number;
    category: string;
    incomeDate: string;
    paymentMethod?: string | null;
  }[];
}

export default interface ExpensesRepository {
  create(data: CreateExpenseData): Promise<ExpenseEntity>;
  update(
    id: string,
    condominiumId: string,
    data: UpdateExpenseData,
  ): Promise<ExpenseEntity>;
  delete(id: string, condominiumId: string): Promise<ExpenseEntity>;
  findById(id: string, condominiumId: string): Promise<ExpenseEntity | null>;
  findByPeriod(
    condominiumId: string,
    params: FindExpensesParams,
  ): Promise<{
    period: string;
    count: number;
    totalAmount: number;
    records: ExpenseEntity[];
  }>;
  getSummary(condominiumId: string, period: string): Promise<ExpensesSummary>;
  getTransparencyConfig(condominiumId: string): Promise<any>;
  updateTransparencyConfig(
    condominiumId: string,
    data: UpdateTransparencyConfigData,
  ): Promise<any>;
  getTransparencyReport(
    condominiumId: string,
    period?: string,
  ): Promise<TransparencyReport>;
}
