import ExtraordinaryFeeRepository from '../../domain/repositories/extraordinary-fee.repository';

export class GetExtraordinaryFeesUseCase {
  constructor(private readonly repository: ExtraordinaryFeeRepository) {}

  async execute(condominiumId: string, status?: string) {
    return await this.repository.findAll(condominiumId, status);
  }
}
