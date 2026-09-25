import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import BillingRepository, {
  CreateExtraIncomeData,
} from '../../domain/repositories/billing.repository';
import { ExtraIncomeEntity } from '../../domain/entities/extra-income.entity';

@Injectable()
export class CreateExtraIncomeUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.BillingRepository)
    private readonly billingRepository: BillingRepository,
  ) {}

  async execute(data: CreateExtraIncomeData): Promise<ExtraIncomeEntity> {
    return await this.billingRepository.createExtraIncome(data);
  }
}
