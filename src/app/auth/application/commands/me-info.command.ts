import { UserRole } from '@/core/infrastructure/persistence/prisma/generated/browser';

export interface MeInfoDTO {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  condominiumKey: string;
  condominiumName: string;
  phone: string;
  updatedAt: string;
}
