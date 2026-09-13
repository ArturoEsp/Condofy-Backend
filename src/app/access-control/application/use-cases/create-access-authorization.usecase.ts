import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import VisitorsRepository from '../../domain/repositories/visitors.repository';
import AccessAuthorizationsRepository from '../../domain/repositories/access-authorizations.repository';
import { CreateAccessAuthorizationCommand } from '../commands/create-access-authorization.command';
import { ResidentNotFoundException } from '@/app/residents/application/use-cases/create-family-member.usecase';
import { ResidentHouseNotFoundException } from '@/app/residents/application/use-cases/get-my-house.usecase';
import { CannotCreateVisitsException } from '../exceptions/cannot-create-visits.exception';
import { VisitorNotFoundException } from '../exceptions/visitor-not-found.exception';
import { InvalidDateRangeException } from '../exceptions/invalid-date-range.exception';
import { AccessAuthorizationEntity } from '../../domain/entities/access-authorization.entity';
import { AuthorizationStatus } from '@/core/infrastructure/persistence/prisma/generated/enums';
import * as crypto from 'crypto';

export class CreateAccessAuthorizationUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly visitorsRepository: VisitorsRepository,
    private readonly accessAuthorizationsRepository: AccessAuthorizationsRepository,
  ) {}

  async execute(
    command: CreateAccessAuthorizationCommand,
  ): Promise<AccessAuthorizationEntity> {
    const resident = await this.residentsRepository.findOneByUserId(
      command.currentUserId,
    );

    if (!resident || resident.condominiumId !== command.condominiumId) {
      throw new ResidentNotFoundException();
    }

    if (!resident.canCreateVisits) {
      throw new CannotCreateVisitsException();
    }

    if (!resident.houseId) {
      throw new ResidentHouseNotFoundException();
    }

    const visitor = await this.visitorsRepository.findOneById(
      command.visitorId,
    );

    if (!visitor || visitor.houseId !== resident.houseId) {
      throw new VisitorNotFoundException();
    }

    const now = new Date();
    const validFrom = command.validFrom ? new Date(command.validFrom) : now;
    const validUntil = command.validUntil ? new Date(command.validUntil) : null;

    if (validUntil && validUntil < validFrom) {
      throw new InvalidDateRangeException();
    }

    if (command.type === 'DATE_RANGE' && !validUntil) {
      throw new InvalidDateRangeException(
        'Para una autorización de tipo rango de fechas es obligatorio especificar validUntil.',
      );
    }

    const maxEntries =
      command.type === 'ONE_TIME'
        ? (command.maxEntries ?? 1)
        : (command.maxEntries ?? null);

    // Generación de PIN numérico de 6 dígitos único
    const pin = this.generatePin();

    // Estado inicial: ACTIVE si ya es vigente, o PENDING si es fecha futura
    const status: AuthorizationStatus =
      validFrom > now
        ? AuthorizationStatus.PENDING
        : AuthorizationStatus.ACTIVE;

    const access = await this.accessAuthorizationsRepository.create({
      visitorId: visitor.id,
      qrCode: pin,
      vehiclePlate: command.vehiclePlate ?? visitor.vehiclePlate ?? null,
      type: command.type,
      status,
      validFrom,
      validUntil,
      maxEntries,
      notes: command.notes ?? null,
    });

    return access;
  }

  private generatePin(): string {
    return crypto.randomInt(100000, 999999).toString();
  }
}
