import { ApiProperty } from '@nestjs/swagger';
import { ExpenseResponse } from './expense.response';

export class ExpensesListResponse {
  @ApiProperty({ example: '2026-09' })
  period: string;

  @ApiProperty({ example: 8 })
  count: number;

  @ApiProperty({ example: 23190.5 })
  totalAmount: number;

  @ApiProperty({ type: [ExpenseResponse] })
  records: ExpenseResponse[];
}
