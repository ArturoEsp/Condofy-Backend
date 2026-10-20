import { AmenityReservationType } from '@/core/infrastructure/persistence/prisma/generated/client';

export interface CreateAmenityCommand {
  condominiumId: string;
  name: string;
  description?: string;
  capacity?: number;
  isActive?: boolean;
  cost?: number;
  requiresDeposit?: boolean;
  depositAmount?: number;
  rulesDocumentUrl?: string;
  rulesDocumentName?: string;
  rulesText?: string;
  photos?: string[];
  reservationType?: AmenityReservationType;
  openingTime?: string;
  closingTime?: string;
  availableDays?: number[];
  minNoticeHours?: number;
  maxNoticeDays?: number;
  maxHoursPerReservation?: number;
  requiresApproval?: boolean;
}
