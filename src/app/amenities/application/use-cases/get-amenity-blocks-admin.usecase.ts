import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenitiesRepository } from '../../domain/repositories/amenities.repository';
import { AmenityBlockPeriodEntity } from '../../domain/entities/amenity-block-period.entity';

@Injectable()
export class GetAmenityBlocksAdminUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenitiesRepository)
    private readonly amenitiesRepository: AmenitiesRepository,
  ) {}

  async execute(
    condominiumId: string,
    amenityId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AmenityBlockPeriodEntity[]> {
    return this.amenitiesRepository.findBlocks(
      amenityId,
      condominiumId,
      startDate,
      endDate,
    );
  }
}
