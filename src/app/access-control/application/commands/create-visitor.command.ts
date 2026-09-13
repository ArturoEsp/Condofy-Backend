import { VisitorCategory } from '@/core/infrastructure/persistence/prisma/generated/enums';

export interface CreateVisitorCommand {
  currentUserId: string;
  condominiumId: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  photo?: string;
  category: VisitorCategory;
  vehiclePlate?: string;
  notes?: string;
}
