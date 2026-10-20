import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenityReservationsRepository } from '../../domain/repositories/amenity-reservations.repository';
import { AmenityReservationEntity } from '../../domain/entities/amenity-reservation.entity';
import { GetReservationsQuery } from '../queries/get-reservations.query';

@Injectable()
export class GetReservationsAdminUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenityReservationsRepository)
    private readonly reservationsRepository: AmenityReservationsRepository,
  ) {}

  async execute(
    query: GetReservationsQuery,
  ): Promise<AmenityReservationEntity[]> {
    return this.reservationsRepository.findAll({
      condominiumId: query.condominiumId,
      amenityId: query.amenityId,
      residentId: query.residentId,
      houseId: query.houseId,
      status: query.status,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
  }
}
