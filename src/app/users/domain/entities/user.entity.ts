import {
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export class UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
