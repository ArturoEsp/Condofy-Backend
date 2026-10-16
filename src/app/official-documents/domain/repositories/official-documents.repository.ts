import {
  OfficialDocumentCategory,
  DocumentTargetScope,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { OfficialDocumentEntity } from '../entities/official-document.entity';
import { OfficialDocumentAcknowledgmentEntity } from '../entities/official-document-acknowledgment.entity';

export interface CreateOfficialDocumentData {
  condominiumId: string;
  title: string;
  description?: string | null;
  category: OfficialDocumentCategory;
  fileUrl: string;
  fileName: string;
  fileSize?: string | null;
  mimeType?: string | null;
  version?: string | null;
  isPublished: boolean;
  requiresAcknowledgment: boolean;
  targetScope: DocumentTargetScope;
  createdById: string;
  assignedHouseIds?: string[];
}

export interface UpdateOfficialDocumentData {
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
}

export interface FindAllOfficialDocumentsParams {
  condominiumId: string;
  category?: OfficialDocumentCategory;
  isPublished?: boolean;
  search?: string;
  skip?: number;
  take?: number;
}

export interface FindResidentOfficialDocumentsParams {
  condominiumId: string;
  userId: string;
  houseId?: string | null;
  category?: OfficialDocumentCategory;
  search?: string;
}

export interface OfficialDocumentsRepository {
  create(data: CreateOfficialDocumentData): Promise<OfficialDocumentEntity>;
  findById(
    id: string,
    condominiumId: string,
    userId?: string,
  ): Promise<OfficialDocumentEntity | null>;
  findAll(
    params: FindAllOfficialDocumentsParams,
  ): Promise<{ documents: OfficialDocumentEntity[]; total: number }>;
  findForResident(
    params: FindResidentOfficialDocumentsParams,
  ): Promise<OfficialDocumentEntity[]>;
  update(
    id: string,
    condominiumId: string,
    data: UpdateOfficialDocumentData,
  ): Promise<OfficialDocumentEntity>;
  togglePublish(
    id: string,
    condominiumId: string,
    isPublished: boolean,
  ): Promise<OfficialDocumentEntity>;
  delete(id: string, condominiumId: string): Promise<void>;
  recordView(
    documentId: string,
    userId: string,
    houseId?: string | null,
  ): Promise<void>;
  recordAcknowledgment(
    documentId: string,
    userId: string,
    houseId?: string | null,
  ): Promise<OfficialDocumentAcknowledgmentEntity>;
  findAcknowledgments(
    documentId: string,
    condominiumId: string,
  ): Promise<OfficialDocumentAcknowledgmentEntity[]>;
  getResidentUserIds(
    condominiumId: string,
    houseIds?: string[],
  ): Promise<string[]>;
}
