import { OfficialDocumentCategory } from '@/core/infrastructure/persistence/prisma/generated/client';

export interface GetResidentOfficialDocumentsQuery {
  condominiumId: string;
  userId: string;
  houseId?: string | null;
  category?: OfficialDocumentCategory;
  search?: string;
}
