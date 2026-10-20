import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AmenityReservationType } from '@/core/infrastructure/persistence/prisma/generated/client';
import { AmenityEntity } from '../../../domain/entities/amenity.entity';

export class AmenityResponse {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  @Expose()
  condominiumId: string;

  @ApiProperty({ example: 'Palapa Principal' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ example: 'Incluye asador, mesas y sanitarios.' })
  @Expose()
  description?: string | null;

  @ApiPropertyOptional({ example: 50 })
  @Expose()
  capacity?: number | null;

  @ApiProperty({ example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty({ example: 500 })
  @Expose()
  cost: number;

  @ApiProperty({ example: true })
  @Expose()
  requiresDeposit: boolean;

  @ApiPropertyOptional({ example: 1000 })
  @Expose()
  depositAmount?: number | null;

  @ApiPropertyOptional({ example: 'https://...' })
  @Expose()
  rulesDocumentUrl?: string | null;

  @ApiPropertyOptional({ example: 'Reglamento_Palapa.pdf' })
  @Expose()
  rulesDocumentName?: string | null;

  @ApiPropertyOptional({ example: 'Prohibido bocinas de alto poder.' })
  @Expose()
  rulesText?: string | null;

  @ApiProperty({ type: [String], example: ['https://storage.condofy.com/photo.jpg'] })
  @Expose()
  photos: string[];

  @ApiProperty({ enum: AmenityReservationType, example: AmenityReservationType.PER_DAY })
  @Expose()
  reservationType: AmenityReservationType;

  @ApiPropertyOptional({ example: '08:00' })
  @Expose()
  openingTime?: string | null;

  @ApiPropertyOptional({ example: '22:00' })
  @Expose()
  closingTime?: string | null;

  @ApiProperty({ type: [Number], example: [0, 1, 2, 3, 4, 5, 6] })
  @Expose()
  availableDays: number[];

  @ApiProperty({ example: 24 })
  @Expose()
  minNoticeHours: number;

  @ApiProperty({ example: 30 })
  @Expose()
  maxNoticeDays: number;

  @ApiPropertyOptional({ example: 4 })
  @Expose()
  maxHoursPerReservation?: number | null;

  @ApiProperty({ example: true })
  @Expose()
  requiresApproval: boolean;

  @ApiProperty({ example: '2026-10-19T10:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-10-19T10:00:00.000Z' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({ example: 5 })
  @Expose()
  totalReservations?: number;

  static fromDomain(entity: AmenityEntity): AmenityResponse {
    const res = new AmenityResponse();
    res.id = entity.id;
    res.condominiumId = entity.condominiumId;
    res.name = entity.name;
    res.description = entity.description;
    res.capacity = entity.capacity;
    res.isActive = entity.isActive;
    res.cost = entity.cost;
    res.requiresDeposit = entity.requiresDeposit;
    res.depositAmount = entity.depositAmount;
    res.rulesDocumentUrl = entity.rulesDocumentUrl;
    res.rulesDocumentName = entity.rulesDocumentName;
    res.rulesText = entity.rulesText;
    res.photos = entity.photos;
    res.reservationType = entity.reservationType;
    res.openingTime = entity.openingTime;
    res.closingTime = entity.closingTime;
    res.availableDays = entity.availableDays;
    res.minNoticeHours = entity.minNoticeHours;
    res.maxNoticeDays = entity.maxNoticeDays;
    res.maxHoursPerReservation = entity.maxHoursPerReservation;
    res.requiresApproval = entity.requiresApproval;
    res.createdAt = entity.createdAt;
    res.updatedAt = entity.updatedAt;
    res.totalReservations = entity.totalReservations;
    return res;
  }
}
