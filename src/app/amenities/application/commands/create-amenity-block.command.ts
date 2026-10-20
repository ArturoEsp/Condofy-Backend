export interface CreateAmenityBlockCommand {
  amenityId: string;
  condominiumId: string;
  title: string;
  reason?: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  createdBy?: string;
}
