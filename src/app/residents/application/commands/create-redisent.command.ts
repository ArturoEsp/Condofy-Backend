import { ResidentType } from '@/core/infrastructure/persistence/prisma/generated/browser';

export interface CreateResidentCommand {
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string;
  password: string;
  houseId: string;
  residentType: ResidentType;
  condominiumId: string;
}
