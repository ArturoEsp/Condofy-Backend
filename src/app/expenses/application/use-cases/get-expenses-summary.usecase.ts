import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import ExpensesRepository, {
  ExpensesSummary,
} from '../../domain/repositories/expenses.repository';

@Injectable()
export class GetExpensesSummaryUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.ExpensesRepository)
    private readonly expensesRepository: ExpensesRepository,
  ) {}

  async execute(
    condominiumId: string,
    period: string,
  ): Promise<ExpensesSummary> {
    return await this.expensesRepository.getSummary(condominiumId, period);
  }
}
