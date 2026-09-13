import { AuthorizationStatus } from '@/core/infrastructure/persistence/prisma/generated/enums';

export interface UpdateAccessAuthorizationCommand {
  id: string;
  currentUserId: string;
  condominiumId: string;
  status?: AuthorizationStatus;
  vehiclePlate?: string;
  validUntil?: Date | string;
  notes?: string;
}
