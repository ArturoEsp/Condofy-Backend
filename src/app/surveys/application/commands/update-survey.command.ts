import { SurveyStatus } from '../../domain/entities/survey.entity';

export interface UpdateSurveyCommand {
  id: string;
  condominiumId: string;
  title?: string;
  description?: string;
  status?: SurveyStatus;
  resultsVisibleToResidents?: boolean;
  endDate?: Date | null;
}
