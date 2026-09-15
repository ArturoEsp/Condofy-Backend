import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import VisitorsRepository from '../../domain/repositories/visitors.repository';
import AccessAuthorizationsRepository from '../../domain/repositories/access-authorizations.repository';
import { ResidentNotFoundException } from '@/app/residents/application/use-cases/create-family-member.usecase';
import { ResidentHouseNotFoundException } from '@/app/residents/application/use-cases/get-my-house.usecase';
import { CannotCreateVisitsException } from '../exceptions/cannot-create-visits.exception';
import { AccessAuthorizationEntity } from '../../domain/entities/access-authorization.entity';
import {
  AuthorizationStatus,
  AuthorizationType,
  VisitorCategory,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import * as crypto from 'crypto';

export interface ResidentCreateDeliveryPassCommand {
  currentUserId: string;
  condominiumId: string;
  company: string;
  notes?: string;
  vehiclePlate?: string;
  durationHours?: number;
}

export class ResidentCreateDeliveryPassUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly visitorsRepository: VisitorsRepository,
    private readonly accessAuthorizationsRepository: AccessAuthorizationsRepository,
  ) {}

  async execute(
    command: ResidentCreateDeliveryPassCommand,
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

    const companyName = command.company.trim() || 'Delivery';

    // Buscar si ya existe un visitante "Repartidor {Empresa}" para esta casa para reutilizarlo
    const visitors = await this.visitorsRepository.findManyByHouseId(
      resident.houseId,
    );
    let visitor = visitors.find(
      (v) =>
        v.category === VisitorCategory.DELIVERY &&
        v.firstName.toLowerCase() === 'repartidor' &&
        v.lastName?.toLowerCase() === companyName.toLowerCase(),
    );

    if (!visitor) {
      visitor = await this.visitorsRepository.create({
        houseId: resident.houseId,
        firstName: 'Repartidor',
        lastName: companyName,
        category: VisitorCategory.DELIVERY,
        notes: `Repartidor de ${companyName}`,
      });
    }

    const now = new Date();
    const durationHours = command.durationHours ?? 2;
    const validUntil = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
    const pin = crypto.randomInt(100000, 999999).toString();

    const pass = await this.accessAuthorizationsRepository.create({
      visitorId: visitor.id,
      qrCode: pin,
      vehiclePlate: command.vehiclePlate?.trim() || null,
      type: AuthorizationType.ONE_TIME,
      status: AuthorizationStatus.ACTIVE,
      validFrom: now,
      validUntil,
      maxEntries: 1,
      notes: command.notes?.trim() || `Entrega express de ${companyName}`,
    });

    return pass;
  }
}
