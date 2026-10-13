export interface GetResidentSurveysQuery {
  condominiumId: string;
  userId: string;
  search?: string;
  page?: number;
  limit?: number;
}
