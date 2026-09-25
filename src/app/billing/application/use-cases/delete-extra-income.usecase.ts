import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import BillingRepository from '../../domain/repositories/billing.repository';
import { ExtraIncomeEntity } from '../../domain/entities/extra-income.entity';

@Injectable()
export class DeleteExtraIncomeUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.BillingRepository)
    private readonly billingRepository: BillingRepository,
  ) {}

  async execute(condominiumId: string, id: string): Promise<ExtraIncomeEntity> {
    return await this.billingRepository.deleteExtraIncome(id, condominiumId);
  }
}
