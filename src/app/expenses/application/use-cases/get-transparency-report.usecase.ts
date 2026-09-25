import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import ExpensesRepository from '../../domain/repositories/expenses.repository';

@Injectable()
export class GetTransparencyReportUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.ExpensesRepository)
    private readonly expensesRepository: ExpensesRepository,
  ) {}

  async execute(condominiumId: string, period?: string) {
    return await this.expensesRepository.getTransparencyReport(
      condominiumId,
      period,
    );
  }
}
