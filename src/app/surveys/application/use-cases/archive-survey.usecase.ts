import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { SurveysRepository } from '../../domain/repositories/surveys.repository';
import { SurveyEntity } from '../../domain/entities/survey.entity';
import { ArchiveSurveyCommand } from '../commands/archive-survey.command';
import { SurveyNotFoundException } from '../exceptions/survey-not-found.exception';

@Injectable()
export class ArchiveSurveyUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.SurveysRepository)
    private readonly repository: SurveysRepository,
  ) {}

  async execute(command: ArchiveSurveyCommand): Promise<SurveyEntity> {
    const existing = await this.repository.findById(
      command.id,
      command.condominiumId,
    );
    if (!existing) {
      throw new SurveyNotFoundException();
    }

    return this.repository.changeStatus(
      command.id,
      command.condominiumId,
      'ARCHIVED',
    );
  }
}
