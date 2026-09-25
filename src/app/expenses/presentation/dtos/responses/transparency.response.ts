import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class TransparencyConfigResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  condominiumId: string;

  @ApiProperty()
  @Expose()
  isEnabled: boolean;

  @ApiProperty()
  @Expose()
  showExpenses: boolean;

  @ApiProperty()
  @Expose()
  showIncomes: boolean;

  @ApiProperty()
  @Expose()
  showBalance: boolean;

  @ApiProperty()
  @Expose()
  showSuppliers: boolean;

  @ApiProperty()
  @Expose()
  showInvoices: boolean;

  @ApiProperty()
  @Expose()
  showDetailedReceipts: boolean;

  @ApiProperty()
  @Expose()
  updatedAt: string;
}

export class TransparencySummaryResponse {
  @ApiProperty()
  @Expose()
  initialBalance: number;

  @ApiProperty()
  @Expose()
  initialReserveFund: number;

  @ApiProperty()
  @Expose()
  periodMaintenanceIncome: number;

  @ApiProperty()
  @Expose()
  periodExtraIncome: number;

  @ApiProperty()
  @Expose()
  totalPeriodIncome: number;

  @ApiProperty()
  @Expose()
  totalPeriodExpenses: number;

  @ApiProperty()
  @Expose()
  periodNetCashFlow: number;

  @ApiProperty()
  @Expose()
  currentAvailableBalance: number;
}

export class TransparencyExpenseItem {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  concept: string;

  @ApiProperty()
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  category: string;

  @ApiProperty()
  @Expose()
  expenseDate: string;

  @ApiProperty()
  @Expose()
  paymentMethod: string;

  @ApiPropertyOptional()
  @Expose()
  supplier?: string | null;

  @ApiPropertyOptional()
  @Expose()
  invoiceUrl?: string | null;

  @ApiPropertyOptional()
  @Expose()
  invoiceFileName?: string | null;
}

export class TransparencyExtraIncomeItem {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  concept: string;

  @ApiProperty()
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  category: string;

  @ApiProperty()
  @Expose()
  incomeDate: string;

  @ApiPropertyOptional()
  @Expose()
  paymentMethod?: string | null;
}

export class TransparencyBreakdownItem {
  @ApiProperty()
  @Expose()
  category: string;

  @ApiProperty()
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  percentage: number;
}

export class TransparencyReportResponse {
  @ApiProperty({ type: TransparencyConfigResponse })
  @Expose()
  @Type(() => TransparencyConfigResponse)
  config: TransparencyConfigResponse;

  @ApiProperty()
  @Expose()
  period: string;

  @ApiProperty({ type: TransparencySummaryResponse })
  @Expose()
  @Type(() => TransparencySummaryResponse)
  summary: TransparencySummaryResponse;

  @ApiProperty({ type: [TransparencyBreakdownItem] })
  @Expose()
  @Type(() => TransparencyBreakdownItem)
  expensesBreakdown: TransparencyBreakdownItem[];

  @ApiProperty({ type: [TransparencyExpenseItem] })
  @Expose()
  @Type(() => TransparencyExpenseItem)
  expenses: TransparencyExpenseItem[];

  @ApiProperty({ type: [TransparencyBreakdownItem] })
  @Expose()
  @Type(() => TransparencyBreakdownItem)
  incomesBreakdown: TransparencyBreakdownItem[];

  @ApiProperty({ type: [TransparencyExtraIncomeItem] })
  @Expose()
  @Type(() => TransparencyExtraIncomeItem)
  extraIncomes: TransparencyExtraIncomeItem[];
}
