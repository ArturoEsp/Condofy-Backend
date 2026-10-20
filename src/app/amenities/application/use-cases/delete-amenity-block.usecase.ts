import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenitiesRepository } from '../../domain/repositories/amenities.repository';

@Injectable()
export class DeleteAmenityBlockUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenitiesRepository)
    private readonly amenitiesRepository: AmenitiesRepository,
  ) {}

  async execute(blockId: string, condominiumId: string): Promise<void> {
    await this.amenitiesRepository.deleteBlock(blockId, condominiumId);
  }
}
