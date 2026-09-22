import BillingRepository from '../../domain/repositories/billing.repository';
import { UploadResidentProofCommand } from '../commands/upload-resident-proof.command';

export class UploadResidentProofUseCase {
  constructor(private readonly billingRepository: BillingRepository) {}

  async execute(command: UploadResidentProofCommand) {
    return await this.billingRepository.uploadResidentProof({
      chargeId: command.chargeId,
      condominiumId: command.condominiumId,
      proofUrl: command.proofUrl,
      proofFileName: command.proofFileName,
      transactionReference: command.transactionReference,
      notes: command.notes,
    });
  }
}
