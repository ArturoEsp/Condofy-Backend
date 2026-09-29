import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnnouncementReaderResponse {
  @ApiProperty({ example: 'a12b34c5-67d8-90ef-1234-56789abcdef0' })
  id: string;

  @ApiProperty({ example: 'f87a32d1-0982-4ef8-a123-bc98234ab123' })
  announcementId: string;

  @ApiProperty({ example: 'u98a76b5-43c2-10de-5678-90123abcdef4' })
  userId: string;

  @ApiPropertyOptional({ example: 'Carlos Méndez' })
  residentName?: string;

  @ApiPropertyOptional({ example: 'h123-house-id' })
  houseId?: string | null;

  @ApiPropertyOptional({ example: '12' })
  houseNumber?: string | null;

  @ApiProperty()
  readAt: Date;
}
