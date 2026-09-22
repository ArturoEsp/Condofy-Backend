import BillingRepository from '../../domain/repositories/billing.repository';
import { ReviewResidentProofCommand } from '../commands/review-resident-proof.command';

export class ReviewResidentProofUseCase {
  constructor(private readonly billingRepository: BillingRepository) {}

  async execute(command: ReviewResidentProofCommand) {
    return await this.billingRepository.reviewResidentProof({
      chargeId: command.chargeId,
      condominiumId: command.condominiumId,
      userId: command.userId,
      action: command.action,
      reference: command.reference,
      rejectReason: command.rejectReason,
    });
  }
}
