import { VisitorCategory } from '@/core/infrastructure/persistence/prisma/generated/enums';

export interface ListHouseVisitorsCommand {
  currentUserId: string;
  condominiumId: string;
  search?: string;
  category?: VisitorCategory;
  page?: number;
  size?: number;
  orderBy?: 'asc' | 'desc';
}
