import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import AccessAuthorizationsRepository from '../../domain/repositories/access-authorizations.repository';
import AccessLogsRepository, {
  ResidentAccessLogEntity,
} from '../../domain/repositories/access-logs.repository';
import { ResidentNotFoundException } from '@/app/residents/application/use-cases/create-family-member.usecase';
import { ResidentHouseNotFoundException } from '@/app/residents/application/use-cases/get-my-house.usecase';
import { AccessAuthorizationNotFoundException } from '../exceptions/access-authorization-not-found.exception';

export interface ResidentGetAccessAuthorizationLogsCommand {
  accessAuthorizationId: string;
  currentUserId: string;
  condominiumId: string;
}

export class ResidentGetAccessAuthorizationLogsUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly accessAuthorizationsRepository: AccessAuthorizationsRepository,
    private readonly accessLogsRepository: AccessLogsRepository,
  ) {}

  async execute(
    command: ResidentGetAccessAuthorizationLogsCommand,
  ): Promise<ResidentAccessLogEntity[]> {
    const resident = await this.residentsRepository.findOneByUserId(
      command.currentUserId,
    );

    if (!resident || resident.condominiumId !== command.condominiumId) {
      throw new ResidentNotFoundException();
    }

    if (!resident.houseId) {
      throw new ResidentHouseNotFoundException();
    }

    const access = await this.accessAuthorizationsRepository.findOneById(
      command.accessAuthorizationId,
    );

    if (!access) {
      throw new AccessAuthorizationNotFoundException();
    }

    const authHouseId = access.house?.id || access.visitor?.houseId;
    if (authHouseId && authHouseId !== resident.houseId) {
      throw new AccessAuthorizationNotFoundException(
        'La autorización de acceso no pertenece a su casa.',
      );
    }

    return await this.accessLogsRepository.findLogsByAuthorizationId(
      command.accessAuthorizationId,
    );
  }
}
