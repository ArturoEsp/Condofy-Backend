import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { SurveysRepository } from '../../domain/repositories/surveys.repository';
import { SurveyEntity } from '../../domain/entities/survey.entity';
import { SurveyNotFoundException } from '../exceptions/survey-not-found.exception';

@Injectable()
export class GetSurveyByIdUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.SurveysRepository)
    private readonly repository: SurveysRepository,
  ) {}

  async execute(id: string, condominiumId: string): Promise<SurveyEntity> {
    const survey = await this.repository.findById(id, condominiumId);
    if (!survey) {
      throw new SurveyNotFoundException();
    }
    return survey;
  }
}
