import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import ExpensesRepository from '../../domain/repositories/expenses.repository';
import { CreateExpenseCommand } from '../commands/create-expense.command';
import { ExpenseEntity } from '../../domain/entities/expense.entity';

@Injectable()
export class CreateExpenseUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.ExpensesRepository)
    private readonly expensesRepository: ExpensesRepository,
  ) {}

  async execute(command: CreateExpenseCommand): Promise<ExpenseEntity> {
    return await this.expensesRepository.create(command);
  }
}
