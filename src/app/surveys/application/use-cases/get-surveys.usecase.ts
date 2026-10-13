import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { SurveysRepository } from '../../domain/repositories/surveys.repository';
import { SurveyEntity } from '../../domain/entities/survey.entity';
import { GetSurveysQuery } from '../commands/get-surveys.query';

@Injectable()
export class GetSurveysUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.SurveysRepository)
    private readonly repository: SurveysRepository,
  ) {}

  async execute(
    query: GetSurveysQuery,
  ): Promise<{ surveys: SurveyEntity[]; total: number }> {
    return this.repository.findAll(query);
  }
}
