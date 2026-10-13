import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { SurveysRepository } from '../../domain/repositories/surveys.repository';
import { SurveyEntity } from '../../domain/entities/survey.entity';
import { GetResidentSurveysQuery } from '../commands/get-resident-surveys.query';

@Injectable()
export class GetResidentSurveysUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.SurveysRepository)
    private readonly repository: SurveysRepository,
  ) {}

  async execute(
    query: GetResidentSurveysQuery,
  ): Promise<{ surveys: SurveyEntity[]; total: number }> {
    const { condominiumId, userId, search, page = 1, limit = 20 } = query;

    const residentContext = await this.repository.findResidentContext(
      userId,
      condominiumId,
    );

    // Los residentes solo pueden ver encuestas activas o cerradas (no borradores ni archivadas)
    const result = await this.repository.findAll({
      condominiumId,
      search,
      page,
      limit,
      userId,
      houseId: residentContext.houseId || undefined,
    });

    // Filtrar encuestas que no sean DRAFT ni ARCHIVED
    const visibleSurveys = result.surveys.filter(
      (s) => s.status === 'ACTIVE' || s.status === 'CLOSED',
    );

    return {
      surveys: visibleSurveys,
      total: visibleSurveys.length,
    };
  }
}
