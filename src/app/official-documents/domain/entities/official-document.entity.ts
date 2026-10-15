import {
  OfficialDocumentCategory,
  DocumentTargetScope,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export interface OfficialDocumentProps {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
  assignedHouseIds?: string[];
  totalViews?: number;
  totalAcknowledgments?: number;
  hasUserAcknowledged?: boolean;
  hasUserViewed?: boolean;
}

export class OfficialDocumentEntity {
  readonly id: string;
  readonly condominiumId: string;
  readonly title: string;
  readonly description: string | null;
  readonly category: OfficialDocumentCategory;
  readonly fileUrl: string;
  readonly fileName: string;
  readonly fileSize: string | null;
  readonly mimeType: string | null;
  readonly version: string | null;
  readonly isPublished: boolean;
  readonly requiresAcknowledgment: boolean;
  readonly targetScope: DocumentTargetScope;
  readonly createdById: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly assignedHouseIds: string[];
  readonly totalViews: number;
  readonly totalAcknowledgments: number;
  readonly hasUserAcknowledged?: boolean;
  readonly hasUserViewed?: boolean;

  constructor(props: OfficialDocumentProps) {
    this.id = props.id;
    this.condominiumId = props.condominiumId;
    this.title = props.title;
    this.description = props.description ?? null;
    this.category = props.category;
    this.fileUrl = props.fileUrl;
    this.fileName = props.fileName;
    this.fileSize = props.fileSize ?? null;
    this.mimeType = props.mimeType ?? null;
    this.version = props.version ?? null;
    this.isPublished = props.isPublished;
    this.requiresAcknowledgment = props.requiresAcknowledgment;
    this.targetScope = props.targetScope;
    this.createdById = props.createdById;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.assignedHouseIds = props.assignedHouseIds ?? [];
    this.totalViews = props.totalViews ?? 0;
    this.totalAcknowledgments = props.totalAcknowledgments ?? 0;
    this.hasUserAcknowledged = props.hasUserAcknowledged;
    this.hasUserViewed = props.hasUserViewed;
  }
}
