export class ReviewResidentProofCommand {
  chargeId: string;
  condominiumId: string;
  userId: string;
  action: 'APPROVE' | 'REJECT';
  reference?: string;
  rejectReason?: string;
}
