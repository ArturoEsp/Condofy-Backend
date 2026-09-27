import ExtraordinaryFeeRepository from '../../domain/repositories/extraordinary-fee.repository';

export class GetExtraordinaryFeeByIdUseCase {
  constructor(private readonly repository: ExtraordinaryFeeRepository) {}

  async execute(id: string, condominiumId: string) {
    return await this.repository.findById(id, condominiumId);
  }
}
