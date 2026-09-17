import AccessAuthorizationsRepository from '../../domain/repositories/access-authorizations.repository';
import AccessLogsRepository, {
  AccessLogItemEntity,
} from '../../domain/repositories/access-logs.repository';
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
  constructor(
    private readonly accessAuthorizationsRepository: AccessAuthorizationsRepository,
    private readonly accessLogsRepository: AccessLogsRepository,
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

    return await this.accessLogsRepository.create({
      accessAuthorizationId: command.accessAuthorizationId,
      entryType: command.entryType,
      observations: command.observations,
      userAcceptId: command.userAcceptId,
    });
  }
}
