import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import AccessAuthorizationsRepository from '../../domain/repositories/access-authorizations.repository';
import { UpdateAccessAuthorizationCommand } from '../commands/update-access-authorization.command';
import { ResidentNotFoundException } from '@/app/residents/application/use-cases/create-family-member.usecase';
import { ResidentHouseNotFoundException } from '@/app/residents/application/use-cases/get-my-house.usecase';
import { AccessAuthorizationNotFoundException } from '../exceptions/access-authorization-not-found.exception';
import { InvalidDateRangeException } from '../exceptions/invalid-date-range.exception';
import { AccessAuthorizationEntity } from '../../domain/entities/access-authorization.entity';

export class UpdateAccessAuthorizationUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly accessAuthorizationsRepository: AccessAuthorizationsRepository,
  ) {}

  async execute(
    command: UpdateAccessAuthorizationCommand,
  ): Promise<AccessAuthorizationEntity> {
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

    if (command.validUntil && new Date(command.validUntil) < access.validFrom) {
      throw new InvalidDateRangeException(
        'La fecha de vencimiento no puede ser anterior a la fecha de inicio.',
      );
    }

    return await this.accessAuthorizationsRepository.update(command.id, {
      status: command.status,
      vehiclePlate: command.vehiclePlate,
      validUntil: command.validUntil ? new Date(command.validUntil) : undefined,
      notes: command.notes,
    });
  }
}
