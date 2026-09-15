import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  CourierCompany,
  ParcelStatus,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export class ParcelHouseResponse {
  @ApiProperty({ example: 'house-123' })
  @Expose()
  id: string;

  @ApiProperty({ example: '42' })
  @Expose()
  houseNumber: string;

  @ApiPropertyOptional({ example: 'Torre B' })
  @Expose()
  tower?: string | null;
}

export class ParcelUserResponse {
  @ApiProperty({ example: 'usr-123' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'guardia@condofy.com' })
  @Expose()
  email: string;
}

export class ParcelResponse {
  @ApiProperty({ example: 'a8b9c0d1-1234-5678-90ab-cdef12345678' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'condo-123' })
  @Expose()
  condominiumId: string;

  @ApiProperty({ example: 'house-123' })
  @Expose()
  houseId: string;

  @ApiPropertyOptional({ type: () => ParcelHouseResponse })
  @Expose()
  @Type(() => ParcelHouseResponse)
  house?: ParcelHouseResponse;

  @ApiProperty({ enum: CourierCompany, example: CourierCompany.AMAZON })
  @Expose()
  courier: CourierCompany;

  @ApiPropertyOptional({ example: 'Mandados Locales' })
  @Expose()
  customCourier?: string | null;

  @ApiPropertyOptional({ example: 'TBA123456789' })
  @Expose()
  trackingNumber?: string | null;

  @ApiProperty({ example: 1 })
  @Expose()
  packageCount: number;

  @ApiPropertyOptional({ example: 'https://storage.../photo.jpg' })
  @Expose()
  photoUrl?: string | null;

  @ApiPropertyOptional({ example: 'Caja frágil' })
  @Expose()
  notes?: string | null;

  @ApiProperty({ example: '8492' })
  @Expose()
  pickupCode: string;

  @ApiProperty({ enum: ParcelStatus, example: ParcelStatus.IN_CUSTODY })
  @Expose()
  status: ParcelStatus;

  @ApiProperty({ example: '2026-09-15T11:30:00.000Z' })
  @Expose()
  receivedAt: Date;

  @ApiProperty({ example: 'usr-guardia-id' })
  @Expose()
  receivedById: string;

  @ApiPropertyOptional({ type: () => ParcelUserResponse })
  @Expose()
  @Type(() => ParcelUserResponse)
  receivedBy?: ParcelUserResponse;

  @ApiPropertyOptional({ example: '2026-09-15T11:32:00.000Z' })
  @Expose()
  notifiedAt?: Date | null;

  @ApiProperty({ example: true })
  @Expose()
  notificationSent: boolean;

  @ApiPropertyOptional({ example: '2026-09-15T14:10:00.000Z' })
  @Expose()
  deliveredAt?: Date | null;

  @ApiPropertyOptional({ example: 'usr-guardia-id' })
  @Expose()
  deliveredById?: string | null;

  @ApiPropertyOptional({ type: () => ParcelUserResponse })
  @Expose()
  @Type(() => ParcelUserResponse)
  deliveredBy?: ParcelUserResponse | null;

  @ApiPropertyOptional({ example: 'Carlos Mendoza' })
  @Expose()
  deliveredToName?: string | null;

  @ApiPropertyOptional({ example: 'Recibido en caseta por titular' })
  @Expose()
  deliveryNotes?: string | null;

  @ApiProperty({ example: '2026-09-15T11:30:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-09-15T11:30:00.000Z' })
  @Expose()
  updatedAt: Date;
}

export class ListParcelsResponse {
  @ApiProperty({ type: [ParcelResponse] })
  @Expose()
  @Type(() => ParcelResponse)
  parcels: ParcelResponse[];

  @ApiProperty({ example: 42 })
  @Expose()
  total: number;

  @ApiProperty({ example: 1 })
  @Expose()
  page: number;

  @ApiProperty({ example: 15 })
  @Expose()
  size: number;

  @ApiProperty({ example: 3 })
  @Expose()
  totalPages: number;
}

export class ParcelStatsResponse {
  @ApiProperty({ example: 4 })
  @Expose()
  inCustodyCount: number;

  @ApiProperty({ example: 2 })
  @Expose()
  deliveredTodayCount: number;

  @ApiProperty({ example: 87 })
  @Expose()
  totalDeliveredCount: number;
}
