import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenitiesRepository } from '../../domain/repositories/amenities.repository';
import { AmenityEntity } from '../../domain/entities/amenity.entity';
import { UpdateAmenityCommand } from '../commands/update-amenity.command';

@Injectable()
export class UpdateAmenityUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenitiesRepository)
    private readonly amenitiesRepository: AmenitiesRepository,
  ) {}

  async execute(command: UpdateAmenityCommand): Promise<AmenityEntity> {
    if (command.name !== undefined && command.name.trim().length === 0) {
      throw new BadRequestException(
        'El nombre de la amenidad no puede estar vacío',
      );
    }

    if (command.cost !== undefined && command.cost < 0) {
      throw new BadRequestException(
        'El costo de la amenidad no puede ser negativo',
      );
    }

    if (
      command.requiresDeposit &&
      command.depositAmount !== undefined &&
      command.depositAmount < 0
    ) {
      throw new BadRequestException(
        'El monto de depósito no puede ser negativo',
      );
    }

    return this.amenitiesRepository.update(command.id, command.condominiumId, {
      name: command.name?.trim(),
      description:
        command.description !== undefined
          ? command.description?.trim() || null
          : undefined,
      capacity: command.capacity,
      isActive: command.isActive,
      cost: command.cost,
      requiresDeposit: command.requiresDeposit,
      depositAmount: command.depositAmount,
      rulesDocumentUrl: command.rulesDocumentUrl,
      rulesDocumentName: command.rulesDocumentName,
      rulesText: command.rulesText,
      photos: command.photos,
      reservationType: command.reservationType,
      openingTime: command.openingTime,
      closingTime: command.closingTime,
      availableDays: command.availableDays,
      minNoticeHours: command.minNoticeHours,
      maxNoticeDays: command.maxNoticeDays,
      maxHoursPerReservation: command.maxHoursPerReservation,
      requiresApproval: command.requiresApproval,
    });
  }
}
