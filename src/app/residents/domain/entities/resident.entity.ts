import {
  ResidentType,
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export class ResidentEntity {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  condominiumId: string;
  houseId: string;
  residentType: ResidentType;
  firstName: string;
  lastName: string;
  phone: string | null;
  comments: string;
  createdAt: Date;
  updatedAt: Date;
}
