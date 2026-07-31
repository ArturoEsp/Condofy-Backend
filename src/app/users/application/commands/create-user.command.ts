import {
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export interface CreateUserCommand {
  email: string;
  password: string;
  isEmailVerified: boolean;
  role: UserRole;
  status: UserStatus;
}
