import { ApiProperty } from '@nestjs/swagger';

export class CategoryBreakdownItem {
  @ApiProperty({ example: 'SERVICES' })
  category: string;

  @ApiProperty({ example: 4500.0 })
  amount: number;

  @ApiProperty({ example: 2 })
  count: number;

  @ApiProperty({ example: 25 })
  percentage: number;
}

export class ExpensesSummaryResponse {
  @ApiProperty({ example: '2026-09' })
  period: string;

  @ApiProperty({ example: 23190.5 })
  totalExpenses: number;

  @ApiProperty({ example: 21690.5 })
  paidAmount: number;

  @ApiProperty({ example: 1500.0 })
  pendingAmount: number;

  @ApiProperty({ example: 7 })
  paidCount: number;

  @ApiProperty({ example: 1 })
  pendingCount: number;

  @ApiProperty({ type: [CategoryBreakdownItem] })
  categoryBreakdown: CategoryBreakdownItem[];
}
