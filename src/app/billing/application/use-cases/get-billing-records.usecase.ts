import BillingRepository from '../../domain/repositories/billing.repository';
import { ParamsListBillingCommand } from '../commands/params-list-billing.command';

export class GetBillingRecordsUseCase {
  constructor(private readonly billingRepository: BillingRepository) {}

  async execute(condominiumId: string, params: ParamsListBillingCommand) {
    return await this.billingRepository.getRecordsByPeriod(
      condominiumId,
      params,
    );
  }
}
