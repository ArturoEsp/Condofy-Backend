export interface CreateReservationCommand {
  amenityId: string;
  condominiumId: string;
  residentId: string;
  houseId: string;
  reservationDate: Date;
  startTime?: string;
  endTime?: string;
  notes?: string;
}
