import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class StandContactResponse {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @Expose()
  id: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @Expose()
  condominiumId: string;

  @ApiProperty({ example: 'Caseta Principal' })
  @Expose()
  name: string;

  @ApiProperty({ example: '55 1234 5678' })
  @Expose()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'Ext. 101' })
  @Expose()
  extension: string | null;

  @ApiPropertyOptional({ example: '24/7' })
  @Expose()
  schedule: string | null;

  @ApiProperty({ example: true })
  @Expose()
  hasWhatsapp: boolean;

  @ApiProperty({ example: false })
  @Expose()
  isPrimary: boolean;

  @ApiPropertyOptional({ example: 'Acceso vehicular y peatonal' })
  @Expose()
  notes: string | null;

  @ApiProperty({ example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty({ example: '2026-09-28T12:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-09-28T12:00:00.000Z' })
  @Expose()
  updatedAt: Date;
}
