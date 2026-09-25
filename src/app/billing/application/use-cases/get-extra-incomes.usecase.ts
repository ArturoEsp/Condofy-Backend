import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import BillingRepository, {
  FindExtraIncomeParams,
} from '../../domain/repositories/billing.repository';
import { ExtraIncomeEntity } from '../../domain/entities/extra-income.entity';

@Injectable()
export class GetExtraIncomesUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.BillingRepository)
    private readonly billingRepository: BillingRepository,
  ) {}

  async execute(
    condominiumId: string,
    params: FindExtraIncomeParams,
  ): Promise<ExtraIncomeEntity[]> {
    return await this.billingRepository.getExtraIncomes(condominiumId, params);
  }
}
