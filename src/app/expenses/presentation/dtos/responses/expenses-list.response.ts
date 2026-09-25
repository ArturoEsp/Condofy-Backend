import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ExpenseResponse } from './expense.response';

export class ExpensesListResponse {
  @ApiProperty({ example: '2026-09' })
  @Expose()
  period: string;

  @ApiProperty({ example: 8 })
  @Expose()
  count: number;

  @ApiProperty({ example: 23190.5 })
  @Expose()
  totalAmount: number;

  @ApiProperty({ type: [ExpenseResponse] })
  @Expose()
  @Type(() => ExpenseResponse)
  records: ExpenseResponse[];
}
