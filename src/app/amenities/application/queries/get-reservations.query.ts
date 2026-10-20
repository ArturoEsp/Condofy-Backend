import { AmenityReservationStatus } from '@/core/infrastructure/persistence/prisma/generated/client';

export interface GetReservationsQuery {
  condominiumId: string;
  amenityId?: string;
  residentId?: string;
  houseId?: string;
  status?: AmenityReservationStatus;
  startDate?: Date;
  endDate?: Date;
}
