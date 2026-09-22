import BillingRepository from '../../domain/repositories/billing.repository';

export class GetBillingSettingsUseCase {
  constructor(private readonly billingRepository: BillingRepository) {}

  async execute(condominiumId: string) {
    return await this.billingRepository.getConfig(condominiumId);
  }
}
