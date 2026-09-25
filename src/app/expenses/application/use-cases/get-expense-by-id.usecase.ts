import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import ExpensesRepository from '../../domain/repositories/expenses.repository';
import { ExpenseEntity } from '../../domain/entities/expense.entity';

@Injectable()
export class GetExpenseByIdUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.ExpensesRepository)
    private readonly expensesRepository: ExpensesRepository,
  ) {}

  async execute(
    id: string,
    condominiumId: string,
  ): Promise<ExpenseEntity> {
    const expense = await this.expensesRepository.findById(id, condominiumId);
    if (!expense) {
      throw new NotFoundException('Gasto operativo no encontrado');
    }
    return expense;
  }
}
