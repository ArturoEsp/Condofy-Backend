import {
  SurveyEntity,
  SurveyQuestionType,
  SurveyStatus,
  SurveyVoteType,
} from '../entities/survey.entity';

export interface CreateSurveyOptionInput {
  text: string;
  orderIndex?: number;
}

export interface CreateSurveyQuestionInput {
  title: string;
  description?: string;
  type: SurveyQuestionType;
  isRequired?: boolean;
  orderIndex?: number;
  options: CreateSurveyOptionInput[];
}

export interface CreateSurveyData {
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
  questions: CreateSurveyQuestionInput[];
}

export interface UpdateSurveyData {
  title?: string;
  description?: string;
  status?: SurveyStatus;
  resultsVisibleToResidents?: boolean;
  endDate?: Date | null;
}

export interface FindSurveysFilter {
  condominiumId: string;
  status?: SurveyStatus;
  search?: string;
  page?: number;
  limit?: number;
  userId?: string;
  houseId?: string;
}

export interface SubmitVoteAnswerInput {
  questionId: string;
  optionIds: string[]; // 1 para SINGLE_CHOICE, 1+ para MULTIPLE_CHOICE
}

export interface SubmitVoteData {
  surveyId: string;
  userId: string;
  houseId?: string | null;
  answers: SubmitVoteAnswerInput[];
}

export interface SurveyOptionResult {
  optionId: string;
  text: string;
  votesCount: number;
  percentage: number;
}

export interface SurveyQuestionResult {
  questionId: string;
  title: string;
  type: SurveyQuestionType;
  isRequired: boolean;
  totalVotesForQuestion: number;
  options: SurveyOptionResult[];
}

export interface SurveyResultsData {
  survey: SurveyEntity;
  totalEligibleUnits: number; // total de casas o residentes en el condominio
  totalResponsesCount: number;
  participationPercentage: number;
  questions: SurveyQuestionResult[];
}

export interface SurveysRepository {
  create(data: CreateSurveyData): Promise<SurveyEntity>;
  findById(id: string, condominiumId: string): Promise<SurveyEntity | null>;
  findAll(filter: FindSurveysFilter): Promise<{ surveys: SurveyEntity[]; total: number }>;
  update(id: string, condominiumId: string, data: UpdateSurveyData): Promise<SurveyEntity>;
  changeStatus(id: string, condominiumId: string, status: SurveyStatus): Promise<SurveyEntity>;
  delete(id: string, condominiumId: string): Promise<void>;
  countResponses(surveyId: string): Promise<number>;
  hasUserVoted(surveyId: string, userId: string): Promise<boolean>;
  hasHouseVoted(surveyId: string, houseId: string): Promise<{ voted: boolean; voterName?: string; submittedAt?: Date }>;
  submitVote(data: SubmitVoteData): Promise<void>;
  getResults(surveyId: string, condominiumId: string): Promise<SurveyResultsData>;
  findResidentContext(userId: string, condominiumId: string): Promise<{ houseId: string | null; residentType: string | null }>;
  findNonVoterUserIds(surveyId: string, condominiumId: string, voteType: SurveyVoteType): Promise<string[]>;
  findAllResidentUserIds(condominiumId: string): Promise<string[]>;
}

export default SurveysRepository;

