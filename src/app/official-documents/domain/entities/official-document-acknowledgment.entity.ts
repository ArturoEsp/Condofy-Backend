export interface OfficialDocumentAcknowledgmentProps {
  id: string;
  documentId: string;
  userId: string;
  houseId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  houseNumber?: string | null;
  viewedAt: Date;
  acknowledgedAt?: Date | null;
}

export class OfficialDocumentAcknowledgmentEntity {
  readonly id: string;
  readonly documentId: string;
  readonly userId: string;
  readonly houseId: string | null;
  readonly userName: string | null;
  readonly userEmail: string | null;
  readonly houseNumber: string | null;
  readonly viewedAt: Date;
  readonly acknowledgedAt: Date | null;

  constructor(props: OfficialDocumentAcknowledgmentProps) {
    this.id = props.id;
    this.documentId = props.documentId;
    this.userId = props.userId;
    this.houseId = props.houseId ?? null;
    this.userName = props.userName ?? null;
    this.userEmail = props.userEmail ?? null;
    this.houseNumber = props.houseNumber ?? null;
    this.viewedAt = props.viewedAt;
    this.acknowledgedAt = props.acknowledgedAt ?? null;
  }
}

