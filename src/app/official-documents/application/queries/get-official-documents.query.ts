import { OfficialDocumentCategory } from '@/core/infrastructure/persistence/prisma/generated/client';

export interface GetOfficialDocumentsQuery {
  condominiumId: string;
  category?: OfficialDocumentCategory;
  isPublished?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
