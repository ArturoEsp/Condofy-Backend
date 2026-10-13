import { Inject, Injectable, Logger } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { SurveysRepository } from '../../domain/repositories/surveys.repository';
import { SurveyEntity } from '../../domain/entities/survey.entity';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';
import { CreateSurveyCommand } from '../commands/create-survey.command';
import { SurveyInvalidDataException } from '../exceptions/survey-invalid-data.exception';

@Injectable()
export class CreateSurveyUseCase {
  private readonly logger = new Logger(CreateSurveyUseCase.name);

  constructor(
    @Inject(PROVIDES_NAMES.SurveysRepository)
    private readonly repository: SurveysRepository,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(command: CreateSurveyCommand): Promise<SurveyEntity> {
    if (!command.questions || command.questions.length === 0) {
      throw new SurveyInvalidDataException(
        'La encuesta debe contener al menos una pregunta.',
      );
    }

    for (let i = 0; i < command.questions.length; i++) {
      const q = command.questions[i];
      if (!q.title || q.title.trim() === '') {
        throw new SurveyInvalidDataException(
          `La pregunta #${i + 1} debe tener un título.`,
        );
      }
      if (!q.options || q.options.length < 2) {
        throw new SurveyInvalidDataException(
          `La pregunta #${i + 1} ("${q.title}") debe tener al menos dos opciones de respuesta.`,
        );
      }
    }

    const survey = await this.repository.create({
      condominiumId: command.condominiumId,
      title: command.title,
      description: command.description,
      status: command.status,
      voteType: command.voteType,
      isAnonymous: command.isAnonymous,
      resultsVisibleToResidents: command.resultsVisibleToResidents,
      startDate: command.startDate,
      endDate: command.endDate,
      createdById: command.createdById,
      questions: command.questions,
    });

    if (survey.status === 'ACTIVE') {
      this.sendPushNotification(survey).catch((err) => {
        this.logger.error('Error enviando notificación Push de encuesta:', err);
      });
    }

    return survey;
  }

  private async sendPushNotification(survey: SurveyEntity) {
    try {
      const userIds = await this.repository.findAllResidentUserIds(
        survey.condominiumId,
      );

      if (userIds.length === 0) return;

      await this.webPushService.sendNotificationToUsers(userIds, {
        title: `🗳️ Nueva Encuesta: ${survey.title}`,
        body:
          survey.description ||
          'Hay una nueva votación disponible en tu condominio. ¡Tu opinión cuenta!',
        url: `/residente/encuestas?surveyId=${survey.id}`,
        tag: `survey-${survey.id}`,
        data: {
          surveyId: survey.id,
        },
      });
    } catch (err) {
      this.logger.warn(
        `No se pudo enviar notificación push para la encuesta ${survey.id}: ${err}`,
      );
    }
  }
}
