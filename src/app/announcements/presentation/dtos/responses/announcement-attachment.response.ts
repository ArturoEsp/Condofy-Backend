import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnnouncementAttachmentType } from '@/core/infrastructure/persistence/prisma/generated/client';

export class AnnouncementAttachmentResponse {
  @ApiProperty({ example: 'b6f6d0f1-0268-45fa-bb29-7973c52a9214' })
  id: string;

  @ApiProperty({ example: 'f87a32d1-0982-4ef8-a123-bc98234ab123' })
  announcementId: string;

  @ApiProperty({
    enum: AnnouncementAttachmentType,
    example: AnnouncementAttachmentType.IMAGE,
  })
  type: AnnouncementAttachmentType;

  @ApiProperty({
    example:
      'https://r2.condofy.com/condominiums/xyz/announcements/abc/photo.jpg',
  })
  fileUrl: string;

  @ApiProperty({ example: 'foto_mantenimiento.jpg' })
  fileName: string;

  @ApiPropertyOptional({ example: '1.2 MB' })
  fileSize?: string | null;

  @ApiPropertyOptional({ example: 'image/jpeg' })
  mimeType?: string | null;

  @ApiProperty({ example: 0 })
  order: number;

  @ApiProperty()
  createdAt: Date;
}
