import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import ExpensesRepository, {
  FindExpensesParams,
} from '../../domain/repositories/expenses.repository';
import { ExpenseEntity } from '../../domain/entities/expense.entity';

@Injectable()
export class GetExpensesUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.ExpensesRepository)
    private readonly expensesRepository: ExpensesRepository,
  ) {}

  async execute(
    condominiumId: string,
    params: FindExpensesParams,
  ): Promise<{
    period: string;
    count: number;
    totalAmount: number;
    records: ExpenseEntity[];
  }> {
    return await this.expensesRepository.findByPeriod(condominiumId, params);
  }
}
