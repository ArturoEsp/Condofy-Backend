import {
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export interface CreateUserCommand {
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  isEmailVerified: boolean;
  role: UserRole;
  status: UserStatus;
  condominiumId?: string | null;
}
