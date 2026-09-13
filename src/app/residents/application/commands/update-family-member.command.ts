import { ResidentType } from '@/core/infrastructure/persistence/prisma/generated/enums';

export interface UpdateFamilyMemberCommand {
  currentUserId: string;
  familyMemberId: string;
  condominiumId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  residentType?: Extract<ResidentType, 'FAMILY_MEMBER' | 'TENANT'>;
  canCreateVisits?: boolean;
  comments?: string;
  email?: string;
  password?: string;
}
