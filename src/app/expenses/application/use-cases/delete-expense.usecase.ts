import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import ExpensesRepository from '../../domain/repositories/expenses.repository';
import { ExpenseEntity } from '../../domain/entities/expense.entity';
import { StorageService } from '@/core/domain/services/storage.service';

@Injectable()
export class DeleteExpenseUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.ExpensesRepository)
    private readonly expensesRepository: ExpensesRepository,
    @Inject(PROVIDES_NAMES.StorageService)
    private readonly storageService: StorageService,
  ) {}

  async execute(id: string, condominiumId: string): Promise<ExpenseEntity> {
    const existing = await this.expensesRepository.findById(id, condominiumId);
    if (!existing) {
      throw new NotFoundException('Gasto operativo no encontrado');
    }

    if (existing.invoiceUrl) {
      try {
        await this.storageService.deleteFile(existing.invoiceUrl);
      } catch (err) {
        // Log but do not block deletion
      }
    }

    return await this.expensesRepository.delete(id, condominiumId);
  }
}
