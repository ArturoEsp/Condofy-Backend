import {
  SurveyQuestionType,
  SurveyStatus,
  SurveyVoteType,
} from '../../domain/entities/survey.entity';

export interface CreateSurveyOptionCommand {
  text: string;
  orderIndex?: number;
}

export interface CreateSurveyQuestionCommand {
  title: string;
  description?: string;
  type: SurveyQuestionType;
  isRequired?: boolean;
  orderIndex?: number;
  options: CreateSurveyOptionCommand[];
}

export interface CreateSurveyCommand {
  condominiumId: string;
  title: string;
  description?: string;
  status?: SurveyStatus;
  voteType?: SurveyVoteType;
  isAnonymous?: boolean;
  resultsVisibleToResidents?: boolean;
  startDate?: Date;
  endDate?: Date | null;
  createdById: string;
  questions: CreateSurveyQuestionCommand[];
}
