import { UserRole } from '@/core/infrastructure/persistence/prisma/generated/browser';

export interface MeInfoDTO {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  condominiumKey: string;
  condominiumName: string;
  phone: string;
  updatedAt: string;
}
