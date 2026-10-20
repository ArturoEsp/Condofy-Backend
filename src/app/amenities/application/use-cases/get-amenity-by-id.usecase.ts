import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenitiesRepository } from '../../domain/repositories/amenities.repository';
import { AmenityEntity } from '../../domain/entities/amenity.entity';

@Injectable()
export class GetAmenityByIdUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenitiesRepository)
    private readonly amenitiesRepository: AmenitiesRepository,
  ) {}

  async execute(id: string, condominiumId: string): Promise<AmenityEntity> {
    const amenity = await this.amenitiesRepository.findById(id, condominiumId);
    if (!amenity) {
      throw new NotFoundException('La amenidad especificada no existe');
    }
    return amenity;
  }
}
