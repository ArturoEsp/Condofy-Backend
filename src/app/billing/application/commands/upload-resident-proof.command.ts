export class UploadResidentProofCommand {
  chargeId: string;
  condominiumId: string;
  proofUrl: string;
  proofFileName?: string;
  transactionReference?: string;
  notes?: string;
}
