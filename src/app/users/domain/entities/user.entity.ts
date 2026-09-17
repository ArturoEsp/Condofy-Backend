import {
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export class UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  condominiumId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
