import { AuthorizationType } from '@/core/infrastructure/persistence/prisma/generated/enums';

export interface CreateAccessAuthorizationCommand {
  currentUserId: string;
  condominiumId: string;
  visitorId: string;
  type: AuthorizationType;
  validFrom?: Date | string;
  validUntil?: Date | string;
  maxEntries?: number;
  vehiclePlate?: string;
  notes?: string;
}
