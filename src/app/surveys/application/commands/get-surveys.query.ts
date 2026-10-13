import { SurveyStatus } from '../../domain/entities/survey.entity';

export interface GetSurveysQuery {
  condominiumId: string;
  status?: SurveyStatus;
  search?: string;
  page?: number;
  limit?: number;
  userId?: string;
  houseId?: string;
}
