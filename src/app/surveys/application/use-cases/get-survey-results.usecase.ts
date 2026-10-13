import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import {
  SurveyResultsData,
  SurveysRepository,
} from '../../domain/repositories/surveys.repository';
import { GetSurveyResultsQuery } from '../commands/get-survey-results.query';
import { SurveyNotFoundException } from '../exceptions/survey-not-found.exception';
import { SurveyResultsForbiddenException } from '../exceptions/survey-results-forbidden.exception';

@Injectable()
export class GetSurveyResultsUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.SurveysRepository)
    private readonly repository: SurveysRepository,
  ) {}

  async execute(query: GetSurveyResultsQuery): Promise<SurveyResultsData> {
    const { surveyId, condominiumId, userRole } = query;

    const survey = await this.repository.findById(surveyId, condominiumId);
    if (!survey) {
      throw new SurveyNotFoundException();
    }

    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

    if (!isAdmin) {
      if (survey.status === 'DRAFT') {
        throw new SurveyNotFoundException('Encuesta no encontrada o no disponible.');
      }

      if (!survey.resultsVisibleToResidents) {
        throw new SurveyResultsForbiddenException();
      }
    }

    return this.repository.getResults(surveyId, condominiumId);
  }
}
