import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import AccessAuthorizationsRepository from '../../domain/repositories/access-authorizations.repository';
import { ResidentNotFoundException } from '@/app/residents/application/use-cases/create-family-member.usecase';
import { ResidentHouseNotFoundException } from '@/app/residents/application/use-cases/get-my-house.usecase';
import { AccessAuthorizationNotFoundException } from '../exceptions/access-authorization-not-found.exception';
import { CannotDeleteUsedAccessAuthorizationException } from '../exceptions/cannot-delete-used-access-authorization.exception';
import { AuthorizationStatus } from '@/core/infrastructure/persistence/prisma/generated/enums';

export interface DeleteAccessAuthorizationCommand {
  id: string;
  currentUserId: string;
  condominiumId: string;
}

export class DeleteAccessAuthorizationUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly accessAuthorizationsRepository: AccessAuthorizationsRepository,
  ) {}

  async execute(command: DeleteAccessAuthorizationCommand) {
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
      command.id,
    );

    if (!access) {
      throw new AccessAuthorizationNotFoundException();
    }

    if (!access.visitor || access.visitor.houseId !== resident.houseId) {
      throw new AccessAuthorizationNotFoundException(
        'La autorización de acceso no pertenece a su casa.',
      );
    }

    if (
      access.usedEntries > 0 ||
      access.lastLog !== undefined ||
      access.insideCondo ||
      access.status === AuthorizationStatus.USED
    ) {
      throw new CannotDeleteUsedAccessAuthorizationException();
    }

    await this.accessAuthorizationsRepository.delete(command.id);

    return {
      success: true,
      message: 'Autorización de acceso eliminada exitosamente',
    };
  }
}
