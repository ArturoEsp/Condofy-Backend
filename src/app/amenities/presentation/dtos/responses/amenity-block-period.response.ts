import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AmenityBlockPeriodEntity } from '../../../domain/entities/amenity-block-period.entity';

export class AmenityBlockPeriodResponse {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  @Expose()
  amenityId: string;

  @ApiProperty({ example: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33' })
  @Expose()
  condominiumId: string;

  @ApiProperty({ example: 'Mantenimiento preventivo' })
  @Expose()
  title: string;

  @ApiPropertyOptional({ example: 'Pintura y cambio de luminarias' })
  @Expose()
  reason?: string | null;

  @ApiProperty({ example: '2026-11-01T00:00:00.000Z' })
  @Expose()
  startDate: Date;

  @ApiProperty({ example: '2026-11-02T23:59:59.000Z' })
  @Expose()
  endDate: Date;

  @ApiPropertyOptional({ example: '08:00' })
  @Expose()
  startTime?: string | null;

  @ApiPropertyOptional({ example: '14:00' })
  @Expose()
  endTime?: string | null;

  @ApiPropertyOptional({ example: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44' })
  @Expose()
  createdBy?: string | null;

  @ApiProperty({ example: '2026-10-19T10:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-10-19T10:00:00.000Z' })
  @Expose()
  updatedAt: Date;

  static fromDomain(entity: AmenityBlockPeriodEntity): AmenityBlockPeriodResponse {
    const res = new AmenityBlockPeriodResponse();
    res.id = entity.id;
    res.amenityId = entity.amenityId;
    res.condominiumId = entity.condominiumId;
    res.title = entity.title;
    res.reason = entity.reason;
    res.startDate = entity.startDate;
    res.endDate = entity.endDate;
    res.startTime = entity.startTime;
    res.endTime = entity.endTime;
    res.createdBy = entity.createdBy;
    res.createdAt = entity.createdAt;
    res.updatedAt = entity.updatedAt;
    return res;
  }
}
