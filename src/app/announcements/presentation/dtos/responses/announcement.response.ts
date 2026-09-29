import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AnnouncementCategory,
  AnnouncementPriority,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { AnnouncementAttachmentResponse } from './announcement-attachment.response';
import { AnnouncementReaderResponse } from './announcement-reader.response';

export const computeAnnouncementStatus = (
  isActive: boolean,
  startDate: Date,
  endDate?: Date | null,
  now: Date = new Date(),
): 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DRAFT' => {
  if (!isActive) return 'DRAFT';
  const start = new Date(startDate);
  if (start > now) return 'SCHEDULED';
  if (endDate) {
    const end = new Date(endDate);
    if (end < now) return 'EXPIRED';
  }
  return 'ACTIVE';
};

export class AnnouncementResponse {
  @ApiProperty({ example: 'f87a32d1-0982-4ef8-a123-bc98234ab123' })
  id: string;

  @ApiProperty({ example: 'c12a32d1-0982-4ef8-a123-bc98234ab999' })
  condominiumId: string;

  @ApiProperty({ example: 'Mantenimiento en bombas de agua' })
  title: string;

  @ApiProperty({ example: 'Habrá baja presión este martes' })
  previewMessage: string;

  @ApiProperty({ example: 'Estimados residentes...' })
  content: string;

  @ApiProperty({
    enum: AnnouncementCategory,
    example: AnnouncementCategory.GENERAL,
  })
  category: AnnouncementCategory;

  @ApiProperty({
    enum: AnnouncementPriority,
    example: AnnouncementPriority.NORMAL,
  })
  priority: AnnouncementPriority;

  @ApiProperty({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'SCHEDULED', 'EXPIRED', 'DRAFT'],
  })
  status: string;

  @ApiProperty()
  startDate: Date;

  @ApiPropertyOptional()
  endDate?: Date | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 'Administración' })
  authorName: string;

  @ApiProperty({ example: 12 })
  viewsCount: number;

  @ApiProperty({ type: [AnnouncementAttachmentResponse] })
  attachments: AnnouncementAttachmentResponse[];

  @ApiPropertyOptional({ type: [AnnouncementReaderResponse] })
  readers?: AnnouncementReaderResponse[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
