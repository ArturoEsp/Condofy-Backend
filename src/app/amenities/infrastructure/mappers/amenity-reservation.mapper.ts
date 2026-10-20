import {
  AmenityReservation as PrismaAmenityReservation,
  Amenity as PrismaAmenity,
  User as PrismaUser,
  House as PrismaHouse,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import {
  AmenityReservationEntity,
  AmenityReservationResidentInfo,
  AmenityReservationHouseInfo,
  AmenityReservationAmenityInfo,
} from '../../domain/entities/amenity-reservation.entity';

export type PrismaReservationWithRelations = PrismaAmenityReservation & {
  resident?: Pick<
    PrismaUser,
    'id' | 'email' | 'firstName' | 'lastName' | 'phone'
  > | null;
  house?: Pick<PrismaHouse, 'id' | 'houseNumber' | 'tower'> | null;
  amenity?: Pick<
    PrismaAmenity,
    'id' | 'name' | 'cost' | 'requiresDeposit' | 'depositAmount' | 'photos'
  > | null;
};

export class AmenityReservationMapper {
  static toDomain(
    raw: PrismaReservationWithRelations,
  ): AmenityReservationEntity {
    let resident: AmenityReservationResidentInfo | undefined;
    if (raw.resident) {
      resident = {
        id: raw.resident.id,
        firstName: raw.resident.firstName,
        lastName: raw.resident.lastName,
        email: raw.resident.email,
        phone: raw.resident.phone,
      };
    }

    let house: AmenityReservationHouseInfo | undefined;
    if (raw.house) {
      house = {
        id: raw.house.id,
        houseNumber: raw.house.houseNumber,
        tower: raw.house.tower,
      };
    }

    let amenity: AmenityReservationAmenityInfo | undefined;
    if (raw.amenity) {
      amenity = {
        id: raw.amenity.id,
        name: raw.amenity.name,
        cost: Number(raw.amenity.cost),
        requiresDeposit: raw.amenity.requiresDeposit,
        depositAmount:
          raw.amenity.depositAmount !== null
            ? Number(raw.amenity.depositAmount)
            : null,
        photos: raw.amenity.photos || [],
      };
    }

    return new AmenityReservationEntity({
      id: raw.id,
      amenityId: raw.amenityId,
      condominiumId: raw.condominiumId,
      residentId: raw.residentId,
      houseId: raw.houseId,
      reservationDate: raw.reservationDate,
      startTime: raw.startTime,
      endTime: raw.endTime,
      status: raw.status,
      totalCost: Number(raw.totalCost),
      depositAmount: Number(raw.depositAmount),
      paymentStatus: raw.paymentStatus,
      notes: raw.notes,
      adminNotes: raw.adminNotes,
      approvedAt: raw.approvedAt,
      approvedBy: raw.approvedBy,
      cancelledAt: raw.cancelledAt,
      cancelledBy: raw.cancelledBy,
      cancellationReason: raw.cancellationReason,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      resident,
      house,
      amenity,
    });
  }
}
