import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenitiesRepository } from '../../domain/repositories/amenities.repository';

@Injectable()
export class DeleteAmenityUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenitiesRepository)
    private readonly amenitiesRepository: AmenitiesRepository,
  ) {}

  async execute(id: string, condominiumId: string): Promise<void> {
    await this.amenitiesRepository.delete(id, condominiumId);
  }
}
