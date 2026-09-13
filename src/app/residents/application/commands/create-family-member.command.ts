import { ResidentType } from '@/core/infrastructure/persistence/prisma/generated/enums';

export interface CreateFamilyMemberCommand {
  currentUserId: string;
  condominiumId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  password: string;
  residentType: Extract<ResidentType, 'FAMILY_MEMBER' | 'TENANT'>;
  canCreateVisits?: boolean;
  comments?: string;
}
