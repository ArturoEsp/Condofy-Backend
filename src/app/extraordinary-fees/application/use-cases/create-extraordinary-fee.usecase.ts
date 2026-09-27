import ExtraordinaryFeeRepository, {
  CreateExtraordinaryFeeData,
} from '../../domain/repositories/extraordinary-fee.repository';

export class CreateExtraordinaryFeeUseCase {
  constructor(private readonly repository: ExtraordinaryFeeRepository) {}

  async execute(data: CreateExtraordinaryFeeData) {
    return await this.repository.create(data);
  }
}
