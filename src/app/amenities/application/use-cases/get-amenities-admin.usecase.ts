import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenitiesRepository } from '../../domain/repositories/amenities.repository';
import { AmenityEntity } from '../../domain/entities/amenity.entity';

@Injectable()
export class GetAmenitiesAdminUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenitiesRepository)
    private readonly amenitiesRepository: AmenitiesRepository,
  ) {}

  async execute(condominiumId: string): Promise<AmenityEntity[]> {
    return this.amenitiesRepository.findAll(condominiumId, false);
  }
}
