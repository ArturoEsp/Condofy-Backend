import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import ExpensesRepository, {
  UpdateTransparencyConfigData,
} from '../../domain/repositories/expenses.repository';

@Injectable()
export class UpdateTransparencySettingsUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.ExpensesRepository)
    private readonly expensesRepository: ExpensesRepository,
  ) {}

  async execute(condominiumId: string, data: UpdateTransparencyConfigData) {
    return await this.expensesRepository.updateTransparencyConfig(
      condominiumId,
      data,
    );
  }
}
