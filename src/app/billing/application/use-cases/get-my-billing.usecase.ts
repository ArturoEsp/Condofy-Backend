import BillingRepository from '../../domain/repositories/billing.repository';

export class GetMyBillingUseCase {
  constructor(private readonly billingRepository: BillingRepository) {}

  async execute(userId: string, condominiumId: string) {
    return await this.billingRepository.getMyBillingRecords(
      userId,
      condominiumId,
    );
  }
}
