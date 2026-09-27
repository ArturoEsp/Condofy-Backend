import BillingRepository from '../../domain/repositories/billing.repository';

export class GetHouseStatementUseCase {
  constructor(private readonly billingRepository: BillingRepository) {}

  async execute(houseId: string, condominiumId: string) {
    return await this.billingRepository.getHouseStatement(
      houseId,
      condominiumId,
    );
  }
}
