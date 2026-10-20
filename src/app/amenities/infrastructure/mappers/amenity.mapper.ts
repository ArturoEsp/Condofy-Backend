import {
  Amenity as PrismaAmenity,
  AmenityBlockPeriod as PrismaAmenityBlockPeriod,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { AmenityEntity } from '../../domain/entities/amenity.entity';
import { AmenityBlockPeriodEntity } from '../../domain/entities/amenity-block-period.entity';

export type PrismaAmenityWithRelations = PrismaAmenity & {
  _count?: {
    reservations?: number;
  };
  totalReservations?: number;
};

export class AmenityMapper {
  static toDomain(raw: PrismaAmenityWithRelations): AmenityEntity {
    const totalReservations =
      raw.totalReservations ?? raw._count?.reservations ?? 0;

    return new AmenityEntity({
      id: raw.id,
      condominiumId: raw.condominiumId,
      name: raw.name,
      description: raw.description,
      capacity: raw.capacity,
      isActive: raw.isActive,
      cost: Number(raw.cost),
      requiresDeposit: raw.requiresDeposit,
      depositAmount:
        raw.depositAmount !== null ? Number(raw.depositAmount) : null,
      rulesDocumentUrl: raw.rulesDocumentUrl,
      rulesDocumentName: raw.rulesDocumentName,
      rulesText: raw.rulesText,
      photos: raw.photos || [],
      reservationType: raw.reservationType,
      openingTime: raw.openingTime,
      closingTime: raw.closingTime,
      availableDays: raw.availableDays || [0, 1, 2, 3, 4, 5, 6],
      minNoticeHours: raw.minNoticeHours,
      maxNoticeDays: raw.maxNoticeDays,
      maxHoursPerReservation: raw.maxHoursPerReservation,
      requiresApproval: raw.requiresApproval,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      totalReservations,
    });
  }

  static blockToDomain(
    raw: PrismaAmenityBlockPeriod,
  ): AmenityBlockPeriodEntity {
    return new AmenityBlockPeriodEntity({
      id: raw.id,
      amenityId: raw.amenityId,
      condominiumId: raw.condominiumId,
      title: raw.title,
      reason: raw.reason,
      startDate: raw.startDate,
      endDate: raw.endDate,
      startTime: raw.startTime,
      endTime: raw.endTime,
      createdBy: raw.createdBy,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
