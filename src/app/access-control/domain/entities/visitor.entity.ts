import { VisitorCategory } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class VisitorEntity {
  id: string;
  houseId: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  photo: string | null;
  category: VisitorCategory;
  vehiclePlate: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
