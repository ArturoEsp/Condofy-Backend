import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenitiesRepository } from '../../domain/repositories/amenities.repository';
import { AmenityBlockPeriodEntity } from '../../domain/entities/amenity-block-period.entity';
import { CreateAmenityBlockCommand } from '../commands/create-amenity-block.command';

@Injectable()
export class CreateAmenityBlockUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenitiesRepository)
    private readonly amenitiesRepository: AmenitiesRepository,
  ) {}

  async execute(
    command: CreateAmenityBlockCommand,
  ): Promise<AmenityBlockPeriodEntity> {
    const amenity = await this.amenitiesRepository.findById(
      command.amenityId,
      command.condominiumId,
    );

    if (!amenity) {
      throw new NotFoundException('La amenidad especificada no existe');
    }

    if (!command.title || command.title.trim().length === 0) {
      throw new BadRequestException('El título del bloqueo es obligatorio');
    }

    if (new Date(command.startDate) > new Date(command.endDate)) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser posterior a la fecha de término',
      );
    }

    return this.amenitiesRepository.createBlock({
      amenityId: command.amenityId,
      condominiumId: command.condominiumId,
      title: command.title.trim(),
      reason: command.reason?.trim() || null,
      startDate: new Date(command.startDate),
      endDate: new Date(command.endDate),
      startTime: command.startTime ?? null,
      endTime: command.endTime ?? null,
      createdBy: command.createdBy ?? null,
    });
  }
}
