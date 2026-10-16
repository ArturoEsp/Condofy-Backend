import {
  OfficialDocumentCategory,
  DocumentTargetScope,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export interface UpdateOfficialDocumentCommand {
  id: string;
  condominiumId: string;
  title?: string;
  description?: string | null;
  category?: OfficialDocumentCategory;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string | null;
  mimeType?: string | null;
  version?: string | null;
  isPublished?: boolean;
  requiresAcknowledgment?: boolean;
  targetScope?: DocumentTargetScope;
  assignedHouseIds?: string[];
  notifyResidents?: boolean;
}
