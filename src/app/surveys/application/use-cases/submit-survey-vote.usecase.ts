import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { SurveysRepository } from '../../domain/repositories/surveys.repository';
import { SubmitSurveyVoteCommand } from '../commands/submit-survey-vote.command';
import { SurveyNotFoundException } from '../exceptions/survey-not-found.exception';
import { SurveyNotActiveException } from '../exceptions/survey-not-active.exception';
import { SurveyExpiredException } from '../exceptions/survey-expired.exception';
import { SurveyResidentNoHouseException } from '../exceptions/survey-resident-no-house.exception';
import { SurveyAlreadyVotedException } from '../exceptions/survey-already-voted.exception';
import { SurveyInvalidDataException } from '../exceptions/survey-invalid-data.exception';

@Injectable()
export class SubmitSurveyVoteUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.SurveysRepository)
    private readonly repository: SurveysRepository,
  ) {}

  async execute(command: SubmitSurveyVoteCommand): Promise<{ message: string }> {
    const { surveyId, condominiumId, userId, answers } = command;

    const survey = await this.repository.findById(surveyId, condominiumId);
    if (!survey) {
      throw new SurveyNotFoundException();
    }

    if (survey.status !== 'ACTIVE') {
      throw new SurveyNotActiveException();
    }

    if (survey.endDate && new Date() > new Date(survey.endDate)) {
      throw new SurveyExpiredException();
    }

    // Obtener contexto del residente (casa y tipo)
    const residentContext = await this.repository.findResidentContext(
      userId,
      condominiumId,
    );

    // Validar duplicidad según voteType
    if (survey.voteType === 'PER_HOUSE') {
      if (!residentContext.houseId) {
        throw new SurveyResidentNoHouseException();
      }

      const houseVoteCheck = await this.repository.hasHouseVoted(
        surveyId,
        residentContext.houseId,
      );

      if (houseVoteCheck.voted) {
        const voterDetail = houseVoteCheck.voterName
          ? ` a través de ${houseVoteCheck.voterName}`
          : '';
        throw new SurveyAlreadyVotedException(
          `Tu casa ya registró su voto previamente${voterDetail}. En esta votación se permite un solo voto por casa.`,
        );
      }
    } else {
      const userVoteCheck = await this.repository.hasUserVoted(surveyId, userId);
      if (userVoteCheck) {
        throw new SurveyAlreadyVotedException();
      }
    }

    // Validar preguntas y respuestas
    const questionsMap = new Map((survey.questions || []).map((q) => [q.id, q]));
    const answeredQuestionIds = new Set<string>();

    for (const ans of answers) {
      const question = questionsMap.get(ans.questionId);
      if (!question) {
        throw new SurveyInvalidDataException(
          `La pregunta con ID ${ans.questionId} no pertenece a esta encuesta.`,
        );
      }

      if (!ans.optionIds || ans.optionIds.length === 0) {
        throw new SurveyInvalidDataException(
          `Debes seleccionar al menos una opción para la pregunta "${question.title}".`,
        );
      }

      if (question.type === 'SINGLE_CHOICE' && ans.optionIds.length > 1) {
        throw new SurveyInvalidDataException(
          `La pregunta "${question.title}" es de selección simple; solo puedes elegir una opción.`,
        );
      }

      const validOptionIds = new Set(question.options.map((opt) => opt.id));
      for (const optId of ans.optionIds) {
        if (!validOptionIds.has(optId)) {
          throw new SurveyInvalidDataException(
            `La opción seleccionada con ID ${optId} no es válida para la pregunta "${question.title}".`,
          );
        }
      }

      answeredQuestionIds.add(ans.questionId);
    }

    // Validar que todas las preguntas obligatorias estén contestadas
    for (const question of survey.questions || []) {
      if (question.isRequired && !answeredQuestionIds.has(question.id)) {
        throw new SurveyInvalidDataException(
          `La pregunta obligatoria "${question.title}" no fue contestada.`,
        );
      }
    }

    // Registrar voto en la BD
    await this.repository.submitVote({
      surveyId,
      userId,
      houseId: residentContext.houseId,
      answers,
    });

    return { message: 'Tu voto ha sido registrado exitosamente.' };
  }
}
