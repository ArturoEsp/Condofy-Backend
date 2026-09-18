import {
  ResidentType,
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export class ResidentEntity {
  id: string;
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  condominiumId: string;
  houseId: string;
  houseNumber?: string;
  tower?: string;
  residentType: ResidentType;
  canCreateVisits: boolean;
  firstName: string;
  lastName: string;
  phone: string | null;
  comments: string;
  createdAt: Date;
  updatedAt: Date;
}
