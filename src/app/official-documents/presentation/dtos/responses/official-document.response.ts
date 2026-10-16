import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  OfficialDocumentCategory,
  DocumentTargetScope,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { OfficialDocumentEntity } from '@/app/official-documents/domain/entities/official-document.entity';

export class OfficialDocumentResponse {
  @ApiProperty({ example: 'd3b07384-d113-4f4c-9f6b-0b5c15e8f4a1' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'd3b07384-d113-4f4c-9f6b-0b5c15e8f4a2' })
  @Expose()
  condominiumId: string;

  @ApiProperty({ example: 'Reglamento Interno de Convivencia 2026' })
  @Expose()
  title: string;

  @ApiPropertyOptional({ example: 'Aprobado en asamblea general ordinaria' })
  @Expose()
  description?: string | null;

  @ApiProperty({ enum: OfficialDocumentCategory, example: OfficialDocumentCategory.REGLAMENTO })
  @Expose()
  category: OfficialDocumentCategory;

  @ApiProperty({ example: 'https://storage.condofy.com.mx/documents/reglamento-2026.pdf' })
  @Expose()
  fileUrl: string;

  @ApiProperty({ example: 'reglamento-interno-2026.pdf' })
  @Expose()
  fileName: string;

  @ApiPropertyOptional({ example: '2.4 MB' })
  @Expose()
  fileSize?: string | null;

  @ApiPropertyOptional({ example: 'application/pdf' })
  @Expose()
  mimeType?: string | null;

  @ApiPropertyOptional({ example: 'v2.0' })
  @Expose()
  version?: string | null;

  @ApiProperty({ example: true })
  @Expose()
  isPublished: boolean;

  @ApiProperty({ example: true })
  @Expose()
  requiresAcknowledgment: boolean;

  @ApiProperty({ enum: DocumentTargetScope, example: DocumentTargetScope.ALL })
  @Expose()
  targetScope: DocumentTargetScope;

  @ApiProperty({ type: [String], example: [] })
  @Expose()
  assignedHouseIds: string[];

  @ApiProperty({ example: 45 })
  @Expose()
  totalViews: number;

  @ApiProperty({ example: 32 })
  @Expose()
  totalAcknowledgments: number;

  @ApiPropertyOptional({ example: true, description: 'Solo relevante para el residente que consulta' })
  @Expose()
  hasUserAcknowledged?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Solo relevante para el residente que consulta' })
  @Expose()
  hasUserViewed?: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: OfficialDocumentEntity): OfficialDocumentResponse {
    const res = new OfficialDocumentResponse();
    res.id = entity.id;
    res.condominiumId = entity.condominiumId;
    res.title = entity.title;
    res.description = entity.description;
    res.category = entity.category;
    res.fileUrl = entity.fileUrl;
    res.fileName = entity.fileName;
    res.fileSize = entity.fileSize;
    res.mimeType = entity.mimeType;
    res.version = entity.version;
    res.isPublished = entity.isPublished;
    res.requiresAcknowledgment = entity.requiresAcknowledgment;
    res.targetScope = entity.targetScope;
    res.assignedHouseIds = entity.assignedHouseIds;
    res.totalViews = entity.totalViews;
    res.totalAcknowledgments = entity.totalAcknowledgments;
    res.hasUserAcknowledged = entity.hasUserAcknowledged;
    res.hasUserViewed = entity.hasUserViewed;
    res.createdAt = entity.createdAt;
    res.updatedAt = entity.updatedAt;
    return res;
  }
}
