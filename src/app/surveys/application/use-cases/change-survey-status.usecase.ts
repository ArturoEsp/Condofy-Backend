import { Inject, Injectable, Logger } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { SurveysRepository } from '../../domain/repositories/surveys.repository';
import { SurveyEntity } from '../../domain/entities/survey.entity';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';
import { ChangeSurveyStatusCommand } from '../commands/change-survey-status.command';
import { SurveyNotFoundException } from '../exceptions/survey-not-found.exception';
import { SurveyAlreadyHasResponsesException } from '../exceptions/survey-already-has-responses.exception';

@Injectable()
export class ChangeSurveyStatusUseCase {
  private readonly logger = new Logger(ChangeSurveyStatusUseCase.name);

  constructor(
    @Inject(PROVIDES_NAMES.SurveysRepository)
    private readonly repository: SurveysRepository,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(command: ChangeSurveyStatusCommand): Promise<SurveyEntity> {
    const existing = await this.repository.findById(
      command.id,
      command.condominiumId,
    );
    if (!existing) {
      throw new SurveyNotFoundException();
    }

    if (command.status === 'DRAFT') {
      const responsesCount = await this.repository.countResponses(command.id);
      if (responsesCount > 0) {
        throw new SurveyAlreadyHasResponsesException(
          'No se puede regresar a borrador una encuesta que ya tiene votos registrados.',
        );
      }
    }

    const updated = await this.repository.changeStatus(
      command.id,
      command.condominiumId,
      command.status,
    );

    // Si se activa la encuesta y antes no lo estaba, notificar a los residentes
    if (command.status === 'ACTIVE' && existing.status !== 'ACTIVE') {
      this.sendActivePushNotification(updated).catch((err) => {
        this.logger.error(
          'Error enviando notificación Push de encuesta activa:',
          err,
        );
      });
    }

    // Si se cierra la encuesta y los resultados son visibles para residentes, notificar resultados
    if (
      command.status === 'CLOSED' &&
      existing.status === 'ACTIVE' &&
      updated.resultsVisibleToResidents
    ) {
      this.sendClosedResultsPushNotification(updated).catch((err) => {
        this.logger.error(
          'Error enviando notificación Push de resultados:',
          err,
        );
      });
    }

    return updated;
  }

  private async sendActivePushNotification(survey: SurveyEntity) {
    try {
      const userIds = await this.repository.findAllResidentUserIds(
        survey.condominiumId,
      );

      if (userIds.length === 0) return;

      await this.webPushService.sendNotificationToUsers(userIds, {
        title: `🗳️ Encuesta Activa: ${survey.title}`,
        body:
          survey.description ||
          'Una encuesta ha sido activada en tu condominio. ¡Participa ahora!',
        url: `/residente/encuestas?surveyId=${survey.id}`,
        tag: `survey-${survey.id}`,
        data: {
          surveyId: survey.id,
        },
      });
    } catch (err) {
      this.logger.warn(`No se pudo enviar notificación push: ${err}`);
    }
  }

  private async sendClosedResultsPushNotification(survey: SurveyEntity) {
    try {
      const userIds = await this.repository.findAllResidentUserIds(
        survey.condominiumId,
      );

      if (userIds.length === 0) return;

      await this.webPushService.sendNotificationToUsers(userIds, {
        title: `📊 Resultados publicados: ${survey.title}`,
        body: 'La votación ha concluido. Consulta los resultados oficiales de tu condominio.',
        url: `/residente/encuestas?surveyId=${survey.id}&action=results`,
        tag: `survey-results-${survey.id}`,
        data: {
          surveyId: survey.id,
        },
      });
    } catch (err) {
      this.logger.warn(
        `No se pudo enviar notificación push de resultados: ${err}`,
      );
    }
  }
}
