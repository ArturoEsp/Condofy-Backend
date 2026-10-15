import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { OfficialDocumentAcknowledgmentEntity } from '@/app/official-documents/domain/entities/official-document-acknowledgment.entity';

export class OfficialDocumentAcknowledgmentResponse {
  @ApiProperty({ example: 'd3b07384-d113-4f4c-9f6b-0b5c15e8f4a1' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'd3b07384-d113-4f4c-9f6b-0b5c15e8f4a2' })
  @Expose()
  documentId: string;

  @ApiProperty({ example: 'd3b07384-d113-4f4c-9f6b-0b5c15e8f4a3' })
  @Expose()
  userId: string;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @Expose()
  userName?: string | null;

  @ApiPropertyOptional({ example: 'juan@condofy.com' })
  @Expose()
  userEmail?: string | null;

  @ApiPropertyOptional({ example: 'Torre A - 302' })
  @Expose()
  houseNumber?: string | null;

  @ApiProperty()
  @Expose()
  viewedAt: Date;

  @ApiPropertyOptional()
  @Expose()
  acknowledgedAt?: Date | null;

  static fromEntity(
    entity: OfficialDocumentAcknowledgmentEntity,
  ): OfficialDocumentAcknowledgmentResponse {
    const res = new OfficialDocumentAcknowledgmentResponse();
    res.id = entity.id;
    res.documentId = entity.documentId;
    res.userId = entity.userId;
    res.userName = entity.userName;
    res.userEmail = entity.userEmail;
    res.houseNumber = entity.houseNumber;
    res.viewedAt = entity.viewedAt;
    res.acknowledgedAt = entity.acknowledgedAt;
    return res;
  }
}
