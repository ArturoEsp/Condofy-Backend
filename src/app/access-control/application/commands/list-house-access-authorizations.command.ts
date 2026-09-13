import {
  AuthorizationStatus,
  AuthorizationType,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export interface ListHouseAccessAuthorizationsCommand {
  currentUserId: string;
  condominiumId: string;
  status?: AuthorizationStatus;
  type?: AuthorizationType;
  insideCondo?: boolean;
  search?: string;
  page?: number;
  size?: number;
  orderBy?: 'asc' | 'desc';
}
