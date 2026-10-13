import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { SurveysRepository } from '../../domain/repositories/surveys.repository';
import { GetResidentSurveyStatusQuery } from '../commands/get-resident-survey-status.query';
import { SurveyNotFoundException } from '../exceptions/survey-not-found.exception';

export interface ResidentSurveyStatusResult {
  surveyId: string;
  canVote: boolean;
  reasonCannotVote?: string;
  hasUserVoted: boolean;
  hasHouseVoted: boolean;
  voterName?: string;
  submittedAt?: Date;
}

@Injectable()
export class GetResidentSurveyStatusUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.SurveysRepository)
    private readonly repository: SurveysRepository,
  ) {}

  async execute(
    query: GetResidentSurveyStatusQuery,
  ): Promise<ResidentSurveyStatusResult> {
    const { surveyId, condominiumId, userId } = query;

    const survey = await this.repository.findById(surveyId, condominiumId);
    if (!survey) {
      throw new SurveyNotFoundException();
    }

    if (survey.status === 'DRAFT' || survey.status === 'ARCHIVED') {
      return {
        surveyId,
        canVote: false,
        reasonCannotVote: 'Esta encuesta no está disponible.',
        hasUserVoted: false,
        hasHouseVoted: false,
      };
    }

    const residentContext = await this.repository.findResidentContext(
      userId,
      condominiumId,
    );

    const hasUserVoted = await this.repository.hasUserVoted(surveyId, userId);

    let hasHouseVoted = false;
    let voterName: string | undefined = undefined;
    let submittedAt: Date | undefined = undefined;

    if (residentContext.houseId) {
      const houseCheck = await this.repository.hasHouseVoted(
        surveyId,
        residentContext.houseId,
      );
      hasHouseVoted = houseCheck.voted;
      voterName = houseCheck.voterName;
      submittedAt = houseCheck.submittedAt;
    }

    let canVote = true;
    let reasonCannotVote: string | undefined = undefined;

    if (survey.status === 'CLOSED') {
      canVote = false;
      reasonCannotVote = 'Esta encuesta se encuentra cerrada.';
    } else if (survey.endDate && new Date() > new Date(survey.endDate)) {
      canVote = false;
      reasonCannotVote = 'El periodo de votación ha concluido.';
    } else if (survey.voteType === 'PER_HOUSE') {
      if (!residentContext.houseId) {
        canVote = false;
        reasonCannotVote = 'No tienes una casa asignada para participar.';
      } else if (hasHouseVoted) {
        canVote = false;
        reasonCannotVote = voterName
          ? `Tu casa ya votó a través de ${voterName}.`
          : 'Tu casa ya registró su voto previamente.';
      }
    } else if (survey.voteType === 'PER_RESIDENT') {
      if (hasUserVoted) {
        canVote = false;
        reasonCannotVote = 'Ya has registrado tu voto en esta encuesta.';
      }
    }

    return {
      surveyId,
      canVote,
      reasonCannotVote,
      hasUserVoted,
      hasHouseVoted,
      voterName,
      submittedAt,
    };
  }
}
