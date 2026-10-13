import { SurveyStatus } from '../../domain/entities/survey.entity';

export interface ChangeSurveyStatusCommand {
  id: string;
  condominiumId: string;
  status: SurveyStatus;
}
