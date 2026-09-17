import { Logger } from '@nestjs/common';
import AccessAuthorizationsRepository from '../../domain/repositories/access-authorizations.repository';
import AccessLogsRepository, {
  AccessLogItemEntity,
} from '../../domain/repositories/access-logs.repository';
import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';
import { AccessAuthorizationNotFoundException } from '../exceptions/access-authorization-not-found.exception';
import { AccessAuthorizationInvalidStatusException } from '../exceptions/access-authorization-invalid-status.exception';
import {
  AuthorizationStatus,
  EntryType,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export interface StandRegisterAccessLogCommand {
  condominiumId: string;
  accessAuthorizationId: string;
  entryType: EntryType;
  observations?: string;
  userAcceptId: string;
}

export class StandRegisterAccessLogUseCase {
  private readonly logger = new Logger(StandRegisterAccessLogUseCase.name);

  constructor(
    private readonly accessAuthorizationsRepository: AccessAuthorizationsRepository,
    private readonly accessLogsRepository: AccessLogsRepository,
    private readonly residentsRepository: ResidentsRepository,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(
    command: StandRegisterAccessLogCommand,
  ): Promise<AccessLogItemEntity> {
    const pass = await this.accessAuthorizationsRepository.findOneById(
      command.accessAuthorizationId,
    );

    if (!pass) {
      throw new AccessAuthorizationNotFoundException(
        'El pase de acceso no fue encontrado.',
      );
    }

    if (pass.condominium?.id && pass.condominium.id !== command.condominiumId) {
      throw new AccessAuthorizationNotFoundException(
        'El pase no pertenece a este condominio.',
      );
    }

    if (
      command.entryType === EntryType.ENTRY &&
      (pass.status === AuthorizationStatus.EXPIRED ||
        pass.status === AuthorizationStatus.CANCELLED)
    ) {
      throw new AccessAuthorizationInvalidStatusException(
        `No es posible registrar acceso. El pase se encuentra ${
          pass.status === AuthorizationStatus.EXPIRED ? 'EXPIRADO' : 'REVOCADO'
        }.`,
      );
    }

    if (
      command.entryType === EntryType.ENTRY &&
      pass.status === AuthorizationStatus.USED
    ) {
      throw new AccessAuthorizationInvalidStatusException(
        'Este pase ya utilizó todas las entradas permitidas.',
      );
    }

    const log = await this.accessLogsRepository.create({
      accessAuthorizationId: command.accessAuthorizationId,
      entryType: command.entryType,
      observations: command.observations,
      userAcceptId: command.userAcceptId,
    });

    // Enviar notificación Push a los residentes si es un ingreso (ENTRY)
    if (command.entryType === EntryType.ENTRY) {
      const houseId = pass.house?.id || pass.visitor?.houseId;
      if (houseId) {
        try {
          const residents =
            await this.residentsRepository.findManyByHouseId(houseId);
          const userIds = residents
            .map((resident) => resident.userId)
            .filter(Boolean);

          if (userIds.length > 0) {
            const visitorName = pass.visitor
              ? `${pass.visitor.firstName}${pass.visitor.lastName ? ` ${pass.visitor.lastName}` : ''}`
              : 'Un visitante';

            const plate = pass.vehiclePlate || pass.visitor?.vehiclePlate;
            const plateText = plate ? ` en vehículo con placas ${plate}` : '';

            await this.webPushService.sendNotificationToUsers(userIds, {
              title: '🚗 ¡Tu visita ha ingresado!',
              body: `${visitorName} acaba de registrar su entrada por caseta${plateText}.`,
              url: '/residente/control-accesos',
              tag: `visitor-entry-${pass.id}`,
              data: {
                accessAuthorizationId: pass.id,
                visitorId: pass.visitorId,
                entryType: command.entryType,
              },
            });
          }
        } catch (error) {
          this.logger.error(
            `Error al enviar notificación push de ingreso de visita (${pass.id}):`,
            error,
          );
        }
      }
    }

    return log;
  }
}
