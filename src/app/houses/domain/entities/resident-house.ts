import {
  ResidentType,
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export class ResidentHouse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  comments: string;
  status: UserStatus;
  role: UserRole;
  isEmailVerified: boolean;
  residentType: ResidentType;
  createdAt: string;
  updatedAt: string;
}
