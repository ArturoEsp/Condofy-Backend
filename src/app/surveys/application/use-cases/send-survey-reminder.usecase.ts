import { Inject, Injectable, Logger } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { SurveysRepository } from '../../domain/repositories/surveys.repository';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';
import { SendSurveyReminderCommand } from '../commands/send-survey-reminder.command';
import { SurveyNotFoundException } from '../exceptions/survey-not-found.exception';
import { SurveyNotActiveException } from '../exceptions/survey-not-active.exception';

@Injectable()
export class SendSurveyReminderUseCase {
  private readonly logger = new Logger(SendSurveyReminderUseCase.name);

  constructor(
    @Inject(PROVIDES_NAMES.SurveysRepository)
    private readonly repository: SurveysRepository,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(
    command: SendSurveyReminderCommand,
  ): Promise<{ notifiedResidentsCount: number }> {
    const survey = await this.repository.findById(
      command.surveyId,
      command.condominiumId,
    );

    if (!survey) {
      throw new SurveyNotFoundException();
    }

    if (survey.status !== 'ACTIVE') {
      throw new SurveyNotActiveException(
        'Solo se pueden enviar recordatorios para encuestas que se encuentran activas.',
      );
    }

    const nonVoterUserIds = await this.repository.findNonVoterUserIds(
      survey.id,
      survey.condominiumId,
      survey.voteType,
    );

    if (nonVoterUserIds.length === 0) {
      return { notifiedResidentsCount: 0 };
    }

    try {
      await this.webPushService.sendNotificationToUsers(nonVoterUserIds, {
        title: `⏰ Recordatorio de Votación: ${survey.title}`,
        body:
          survey.voteType === 'PER_HOUSE'
            ? 'Tu unidad aún no ha registrado su voto en esta encuesta. ¡Participa antes de que cierre!'
            : 'Aún no hemos recibido tu respuesta en esta encuesta del condominio. ¡Tu opinión es importante!',
        url: `/residente/encuestas?surveyId=${survey.id}`,
        tag: `survey-reminder-${survey.id}`,
        data: {
          surveyId: survey.id,
        },
      });
    } catch (err) {
      this.logger.warn(
        `Error al enviar recordatorio push para encuesta ${survey.id}: ${err}`,
      );
    }

    return { notifiedResidentsCount: nonVoterUserIds.length };
  }
}

