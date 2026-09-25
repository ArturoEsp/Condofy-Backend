import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import ExpensesRepository from '../../domain/repositories/expenses.repository';
import { UpdateExpenseCommand } from '../commands/update-expense.command';
import { ExpenseEntity } from '../../domain/entities/expense.entity';

@Injectable()
export class UpdateExpenseUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.ExpensesRepository)
    private readonly expensesRepository: ExpensesRepository,
  ) {}

  async execute(command: UpdateExpenseCommand): Promise<ExpenseEntity> {
    const existing = await this.expensesRepository.findById(
      command.id,
      command.condominiumId,
    );
    if (!existing) {
      throw new NotFoundException('Gasto operativo no encontrado');
    }

    return await this.expensesRepository.update(
      command.id,
      command.condominiumId,
      command,
    );
  }
}
