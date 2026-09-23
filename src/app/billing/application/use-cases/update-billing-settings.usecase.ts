import BillingRepository from '../../domain/repositories/billing.repository';
import { UpdateBillingConfigCommand } from '../commands/update-billing-config.command';

export class UpdateBillingSettingsUseCase {
  constructor(private readonly billingRepository: BillingRepository) {}

  async execute(condominiumId: string, command: UpdateBillingConfigCommand) {
    return await this.billingRepository.upsertConfig(condominiumId, command);
  }
}
