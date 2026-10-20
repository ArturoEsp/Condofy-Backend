import {
  AmenityReservationStatus,
  AmenityPaymentStatus,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export interface UpdateReservationStatusCommand {
  reservationId: string;
  condominiumId: string;
  status: AmenityReservationStatus;
  adminNotes?: string;
  approvedBy?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  paymentStatus?: AmenityPaymentStatus;
}
