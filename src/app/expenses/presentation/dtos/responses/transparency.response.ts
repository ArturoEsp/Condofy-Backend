import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransparencyConfigResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  condominiumId: string;

  @ApiProperty()
  isEnabled: boolean;

  @ApiProperty()
  showExpenses: boolean;

  @ApiProperty()
  showIncomes: boolean;

  @ApiProperty()
  showBalance: boolean;

  @ApiProperty()
  showSuppliers: boolean;

  @ApiProperty()
  showInvoices: boolean;

  @ApiProperty()
  showDetailedReceipts: boolean;

  @ApiProperty()
  updatedAt: string;
}

export class TransparencySummaryResponse {
  @ApiProperty()
  initialBalance: number;

  @ApiProperty()
  initialReserveFund: number;

  @ApiProperty()
  periodMaintenanceIncome: number;

  @ApiProperty()
  periodExtraIncome: number;

  @ApiProperty()
  totalPeriodIncome: number;

  @ApiProperty()
  totalPeriodExpenses: number;

  @ApiProperty()
  periodNetCashFlow: number;

  @ApiProperty()
  currentAvailableBalance: number;
}

export class TransparencyExpenseItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  concept: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  category: string;

  @ApiProperty()
  expenseDate: string;

  @ApiProperty()
  paymentMethod: string;

  @ApiPropertyOptional()
  supplier?: string | null;

  @ApiPropertyOptional()
  invoiceUrl?: string | null;

  @ApiPropertyOptional()
  invoiceFileName?: string | null;
}

export class TransparencyExtraIncomeItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  concept: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  category: string;

  @ApiProperty()
  incomeDate: string;

  @ApiPropertyOptional()
  paymentMethod?: string | null;
}

export class TransparencyBreakdownItem {
  @ApiProperty()
  category: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  percentage: number;
}

export class TransparencyReportResponse {
  @ApiProperty({ type: TransparencyConfigResponse })
  config: TransparencyConfigResponse;

  @ApiProperty()
  period: string;

  @ApiProperty({ type: TransparencySummaryResponse })
  summary: TransparencySummaryResponse;

  @ApiProperty({ type: [TransparencyBreakdownItem] })
  expensesBreakdown: TransparencyBreakdownItem[];

  @ApiProperty({ type: [TransparencyExpenseItem] })
  expenses: TransparencyExpenseItem[];

  @ApiProperty({ type: [TransparencyBreakdownItem] })
  incomesBreakdown: TransparencyBreakdownItem[];

  @ApiProperty({ type: [TransparencyExtraIncomeItem] })
  extraIncomes: TransparencyExtraIncomeItem[];
}
