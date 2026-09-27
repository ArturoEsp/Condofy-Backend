import { ExtraordinaryFeeDocumentEntity } from './extraordinary-fee-document.entity';
import { ExtraordinaryFeeChargeEntity } from './extraordinary-fee-charge.entity';

export type ExtraordinaryFeeStatusType = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface ExtraordinaryFeeKpis {
  totalTarget: number;
  totalCollected: number;
  progressPercentage: number;
  totalHouses: number;
  paidHousesCount: number;
  pendingHousesCount: number;
  inReviewHousesCount: number;
}

export class ExtraordinaryFeeEntity {
  id: string;
  condominiumId: string;
  title: string;
  description: string;
  amountPerHouse: number;
  totalTargetAmount?: number | null;
  dueDate: Date;
  status: ExtraordinaryFeeStatusType;
  useCustomBankAccount: boolean;
  bankName?: string | null;
  accountHolder?: string | null;
  clabe?: string | null;
  accountNumber?: string | null;
  paymentReferenceRule?: string | null;
  createdById: string;
  createdByName?: string | null;
  documents: ExtraordinaryFeeDocumentEntity[];
  charges?: ExtraordinaryFeeChargeEntity[];
  kpis?: ExtraordinaryFeeKpis;
  createdAt: Date;
  updatedAt: Date;
}
