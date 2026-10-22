import {
  AmenityReservationStatus,
  AmenityPaymentStatus,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import {
  AmenityReservationEntity,
  AmenityReservationProps,
} from '../entities/amenity-reservation.entity';

export interface FindReservationsFilter {
  condominiumId: string;
  amenityId?: string;
  residentId?: string;
  houseId?: string;
  status?: AmenityReservationStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface AmenityReservationsRepository {
  create(
    data: Omit<
      AmenityReservationProps,
      'id' | 'createdAt' | 'updatedAt' | 'resident' | 'house' | 'amenity'
    >,
  ): Promise<AmenityReservationEntity>;

  findById(
    id: string,
    condominiumId: string,
  ): Promise<AmenityReservationEntity | null>;

  findOverlappingReservations(
    amenityId: string,
    date: Date,
    startTime?: string | null,
    endTime?: string | null,
    excludeReservationId?: string,
  ): Promise<AmenityReservationEntity[]>;

  findAll(filter: FindReservationsFilter): Promise<AmenityReservationEntity[]>;

  updateStatus(
    id: string,
    condominiumId: string,
    data: {
      status: AmenityReservationStatus;
      adminNotes?: string | null;
      approvedAt?: Date | null;
      approvedBy?: string | null;
      cancelledAt?: Date | null;
      cancelledBy?: string | null;
      cancellationReason?: string | null;
      paymentStatus?: AmenityPaymentStatus;
    },
  ): Promise<AmenityReservationEntity>;

  delete(id: string, condominiumId: string): Promise<void>;
}
