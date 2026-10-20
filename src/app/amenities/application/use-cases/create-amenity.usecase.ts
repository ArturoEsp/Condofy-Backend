import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenitiesRepository } from '../../domain/repositories/amenities.repository';
import { AmenityEntity } from '../../domain/entities/amenity.entity';
import { CreateAmenityCommand } from '../commands/create-amenity.command';
import { AmenityReservationType } from '@/core/infrastructure/persistence/prisma/generated/client';

@Injectable()
export class CreateAmenityUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenitiesRepository)
    private readonly amenitiesRepository: AmenitiesRepository,
  ) {}

  async execute(command: CreateAmenityCommand): Promise<AmenityEntity> {
    if (!command.name || command.name.trim().length === 0) {
      throw new BadRequestException('El nombre de la amenidad es obligatorio');
    }

    if (command.cost !== undefined && command.cost < 0) {
      throw new BadRequestException(
        'El costo de la amenidad no puede ser negativo',
      );
    }

    if (
      command.requiresDeposit &&
      (command.depositAmount === undefined || command.depositAmount < 0)
    ) {
      throw new BadRequestException(
        'Si la amenidad requiere depósito, debe especificarse un monto de depósito válido',
      );
    }

    return this.amenitiesRepository.create({
      condominiumId: command.condominiumId,
      name: command.name.trim(),
      description: command.description?.trim() || null,
      capacity: command.capacity ?? null,
      isActive: command.isActive ?? true,
      cost: command.cost ?? 0,
      requiresDeposit: command.requiresDeposit ?? false,
      depositAmount: command.requiresDeposit
        ? (command.depositAmount ?? 0)
        : null,
      rulesDocumentUrl: command.rulesDocumentUrl ?? null,
      rulesDocumentName: command.rulesDocumentName ?? null,
      rulesText: command.rulesText ?? null,
      photos: command.photos ?? [],
      reservationType:
        command.reservationType ?? AmenityReservationType.PER_DAY,
      openingTime: command.openingTime ?? null,
      closingTime: command.closingTime ?? null,
      availableDays: command.availableDays ?? [0, 1, 2, 3, 4, 5, 6],
      minNoticeHours: command.minNoticeHours ?? 24,
      maxNoticeDays: command.maxNoticeDays ?? 30,
      maxHoursPerReservation: command.maxHoursPerReservation ?? null,
      requiresApproval: command.requiresApproval ?? true,
    });
  }
}
