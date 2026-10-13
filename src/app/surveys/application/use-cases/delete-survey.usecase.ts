import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { SurveysRepository } from '../../domain/repositories/surveys.repository';
import { DeleteSurveyCommand } from '../commands/delete-survey.command';
import { SurveyNotFoundException } from '../exceptions/survey-not-found.exception';
import { SurveyAlreadyHasResponsesException } from '../exceptions/survey-already-has-responses.exception';

@Injectable()
export class DeleteSurveyUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.SurveysRepository)
    private readonly repository: SurveysRepository,
  ) {}

  async execute(command: DeleteSurveyCommand): Promise<void> {
    const existing = await this.repository.findById(
      command.id,
      command.condominiumId,
    );
    if (!existing) {
      throw new SurveyNotFoundException();
    }

    const responsesCount = await this.repository.countResponses(command.id);
    if (responsesCount > 0) {
      throw new SurveyAlreadyHasResponsesException();
    }

    await this.repository.delete(command.id, command.condominiumId);
  }
}
