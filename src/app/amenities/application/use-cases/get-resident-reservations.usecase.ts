import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenityReservationsRepository } from '../../domain/repositories/amenity-reservations.repository';
import { AmenityReservationEntity } from '../../domain/entities/amenity-reservation.entity';

@Injectable()
export class GetResidentReservationsUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenityReservationsRepository)
    private readonly reservationsRepository: AmenityReservationsRepository,
  ) {}

  async execute(params: {
    condominiumId: string;
    residentId?: string;
    houseId?: string;
  }): Promise<AmenityReservationEntity[]> {
    return this.reservationsRepository.findAll({
      condominiumId: params.condominiumId,
      residentId: params.residentId,
      houseId: params.houseId,
    });
  }
}
