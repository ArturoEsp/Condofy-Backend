import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class CategoryBreakdownItem {
  @ApiProperty({ example: 'SERVICES' })
  @Expose()
  category: string;

  @ApiProperty({ example: 4500.0 })
  @Expose()
  amount: number;

  @ApiProperty({ example: 2 })
  @Expose()
  count: number;

  @ApiProperty({ example: 25 })
  @Expose()
  percentage: number;
}

export class ExpensesSummaryResponse {
  @ApiProperty({ example: '2026-09' })
  @Expose()
  period: string;

  @ApiProperty({ example: 23190.5 })
  @Expose()
  totalExpenses: number;

  @ApiProperty({ example: 21690.5 })
  @Expose()
  paidAmount: number;

  @ApiProperty({ example: 1500.0 })
  @Expose()
  pendingAmount: number;

  @ApiProperty({ example: 7 })
  @Expose()
  paidCount: number;

  @ApiProperty({ example: 1 })
  @Expose()
  pendingCount: number;

  @ApiProperty({ type: [CategoryBreakdownItem] })
  @Expose()
  @Type(() => CategoryBreakdownItem)
  categoryBreakdown: CategoryBreakdownItem[];
}
