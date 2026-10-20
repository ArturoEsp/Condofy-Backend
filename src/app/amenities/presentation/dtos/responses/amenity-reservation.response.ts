import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  AmenityReservationStatus,
  AmenityPaymentStatus,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { AmenityReservationEntity } from '../../../domain/entities/amenity-reservation.entity';

export class AmenityReservationResidentSummary {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @Expose()
  id: string;

  @ApiPropertyOptional({ example: 'Juan' })
  @Expose()
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Pérez' })
  @Expose()
  lastName?: string | null;

  @ApiProperty({ example: 'juan.perez@example.com' })
  @Expose()
  email: string;

  @ApiPropertyOptional({ example: '+52 55 1234 5678' })
  @Expose()
  phone?: string | null;
}

export class AmenityReservationHouseSummary {
  @ApiProperty({ example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  @Expose()
  id: string;

  @ApiProperty({ example: '104' })
  @Expose()
  houseNumber: string;

  @ApiPropertyOptional({ example: 'Torre A' })
  @Expose()
  tower?: string | null;
}

export class AmenityReservationAmenitySummary {
  @ApiProperty({ example: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Palapa Principal' })
  @Expose()
  name: string;

  @ApiProperty({ example: 500 })
  @Expose()
  cost: number;

  @ApiProperty({ example: true })
  @Expose()
  requiresDeposit: boolean;

  @ApiPropertyOptional({ example: 1000 })
  @Expose()
  depositAmount?: number | null;

  @ApiProperty({ type: [String], example: [] })
  @Expose()
  photos: string[];
}

export class AmenityReservationResponse {
  @ApiProperty({ example: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33' })
  @Expose()
  amenityId: string;

  @ApiProperty({ example: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55' })
  @Expose()
  condominiumId: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @Expose()
  residentId: string;

  @ApiProperty({ example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  @Expose()
  houseId: string;

  @ApiProperty({ example: '2026-11-15T00:00:00.000Z' })
  @Expose()
  reservationDate: Date;

  @ApiPropertyOptional({ example: '14:00' })
  @Expose()
  startTime?: string | null;

  @ApiPropertyOptional({ example: '18:00' })
  @Expose()
  endTime?: string | null;

  @ApiProperty({ enum: AmenityReservationStatus, example: AmenityReservationStatus.PENDING_APPROVAL })
  @Expose()
  status: AmenityReservationStatus;

  @ApiProperty({ example: 500 })
  @Expose()
  totalCost: number;

  @ApiProperty({ example: 1000 })
  @Expose()
  depositAmount: number;

  @ApiProperty({ enum: AmenityPaymentStatus, example: AmenityPaymentStatus.PENDING })
  @Expose()
  paymentStatus: AmenityPaymentStatus;

  @ApiPropertyOptional({ example: 'Fiesta de cumpleaños' })
  @Expose()
  notes?: string | null;

  @ApiPropertyOptional({ example: 'Aprobado por el comité' })
  @Expose()
  adminNotes?: string | null;

  @ApiPropertyOptional({ example: '2026-10-20T12:00:00.000Z' })
  @Expose()
  approvedAt?: Date | null;

  @ApiPropertyOptional({ example: 'admin-id' })
  @Expose()
  approvedBy?: string | null;

  @ApiPropertyOptional({ example: null })
  @Expose()
  cancelledAt?: Date | null;

  @ApiPropertyOptional({ example: null })
  @Expose()
  cancelledBy?: string | null;

  @ApiPropertyOptional({ example: null })
  @Expose()
  cancellationReason?: string | null;

  @ApiProperty({ example: '2026-10-19T10:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-10-19T10:00:00.000Z' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({ type: AmenityReservationResidentSummary })
  @Expose()
  @Type(() => AmenityReservationResidentSummary)
  resident?: AmenityReservationResidentSummary;

  @ApiPropertyOptional({ type: AmenityReservationHouseSummary })
  @Expose()
  @Type(() => AmenityReservationHouseSummary)
  house?: AmenityReservationHouseSummary;

  @ApiPropertyOptional({ type: AmenityReservationAmenitySummary })
  @Expose()
  @Type(() => AmenityReservationAmenitySummary)
  amenity?: AmenityReservationAmenitySummary;

  static fromDomain(entity: AmenityReservationEntity): AmenityReservationResponse {
    const res = new AmenityReservationResponse();
    res.id = entity.id;
    res.amenityId = entity.amenityId;
    res.condominiumId = entity.condominiumId;
    res.residentId = entity.residentId;
    res.houseId = entity.houseId;
    res.reservationDate = entity.reservationDate;
    res.startTime = entity.startTime;
    res.endTime = entity.endTime;
    res.status = entity.status;
    res.totalCost = entity.totalCost;
    res.depositAmount = entity.depositAmount;
    res.paymentStatus = entity.paymentStatus;
    res.notes = entity.notes;
    res.adminNotes = entity.adminNotes;
    res.approvedAt = entity.approvedAt;
    res.approvedBy = entity.approvedBy;
    res.cancelledAt = entity.cancelledAt;
    res.cancelledBy = entity.cancelledBy;
    res.cancellationReason = entity.cancellationReason;
    res.createdAt = entity.createdAt;
    res.updatedAt = entity.updatedAt;
    res.resident = entity.resident;
    res.house = entity.house;
    res.amenity = entity.amenity;
    return res;
  }
}
