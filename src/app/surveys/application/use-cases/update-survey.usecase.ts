import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { SurveysRepository } from '../../domain/repositories/surveys.repository';
import { SurveyEntity } from '../../domain/entities/survey.entity';
import { UpdateSurveyCommand } from '../commands/update-survey.command';
import { SurveyNotFoundException } from '../exceptions/survey-not-found.exception';
import { SurveyAlreadyHasResponsesException } from '../exceptions/survey-already-has-responses.exception';

@Injectable()
export class UpdateSurveyUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.SurveysRepository)
    private readonly repository: SurveysRepository,
  ) {}

  async execute(command: UpdateSurveyCommand): Promise<SurveyEntity> {
    const existing = await this.repository.findById(
      command.id,
      command.condominiumId,
    );
    if (!existing) {
      throw new SurveyNotFoundException();
    }

    const responsesCount = await this.repository.countResponses(command.id);
    if (responsesCount > 0 && command.status === 'DRAFT') {
      throw new SurveyAlreadyHasResponsesException(
        'No se puede regresar la encuesta a borrador porque ya cuenta con votos registrados.',
      );
    }

    return this.repository.update(command.id, command.condominiumId, {
      title: command.title,
      description: command.description,
      status: command.status,
      resultsVisibleToResidents: command.resultsVisibleToResidents,
      endDate: command.endDate,
    });
  }
}
