import ExtraordinaryFeeRepository, {
  RegisterExtraordinaryFeePaymentData,
  ReviewExtraordinaryFeeProofData,
  UploadExtraordinaryFeeProofData,
} from '../../domain/repositories/extraordinary-fee.repository';
import { ExtraordinaryFeeStatusType } from '../../domain/entities/extraordinary-fee.entity';

export class UpdateExtraordinaryFeeStatusUseCase {
  constructor(private readonly repository: ExtraordinaryFeeRepository) {}

  async execute(
    id: string,
    condominiumId: string,
    status: ExtraordinaryFeeStatusType,
  ) {
    return await this.repository.updateStatus(id, condominiumId, status);
  }
}

export class DeleteExtraordinaryFeeUseCase {
  constructor(private readonly repository: ExtraordinaryFeeRepository) {}

  async execute(id: string, condominiumId: string) {
    return await this.repository.delete(id, condominiumId);
  }
}

export class RegisterExtraordinaryFeePaymentUseCase {
  constructor(private readonly repository: ExtraordinaryFeeRepository) {}

  async execute(data: RegisterExtraordinaryFeePaymentData) {
    return await this.repository.registerPayment(data);
  }
}

export class UploadExtraordinaryFeeProofUseCase {
  constructor(private readonly repository: ExtraordinaryFeeRepository) {}

  async execute(data: UploadExtraordinaryFeeProofData) {
    return await this.repository.uploadResidentProof(data);
  }
}

export class ReviewExtraordinaryFeeProofUseCase {
  constructor(private readonly repository: ExtraordinaryFeeRepository) {}

  async execute(data: ReviewExtraordinaryFeeProofData) {
    return await this.repository.reviewResidentProof(data);
  }
}

export class GetMyExtraordinaryFeeChargesUseCase {
  constructor(private readonly repository: ExtraordinaryFeeRepository) {}

  async execute(userId: string, condominiumId: string) {
    return await this.repository.getMyCharges(userId, condominiumId);
  }
}
