import {
  SurveyStatus,
  SurveyVoteType,
  SurveyQuestionType,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export { SurveyStatus, SurveyVoteType, SurveyQuestionType };

export interface SurveyOptionEntity {
  id: string;
  questionId: string;
  text: string;
  orderIndex: number;
  createdAt: Date;
}

export interface SurveyQuestionEntity {
  id: string;
  surveyId: string;
  title: string;
  description?: string | null;
  type: SurveyQuestionType;
  isRequired: boolean;
  orderIndex: number;
  options: SurveyOptionEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyEntity {
  id: string;
  condominiumId: string;
  title: string;
  description?: string | null;
  status: SurveyStatus;
  voteType: SurveyVoteType;
  isAnonymous: boolean;
  resultsVisibleToResidents: boolean;
  startDate: Date;
  endDate?: Date | null;
  createdById: string;
  creatorName?: string;
  questions?: SurveyQuestionEntity[];
  totalResponsesCount?: number;
  hasUserVoted?: boolean;
  hasHouseVoted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
