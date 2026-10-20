import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenitiesRepository } from '../../domain/repositories/amenities.repository';
import { AmenityReservationsRepository } from '../../domain/repositories/amenity-reservations.repository';
import { AmenityEntity } from '../../domain/entities/amenity.entity';
import { AmenityBlockPeriodEntity } from '../../domain/entities/amenity-block-period.entity';
import { AmenityReservationEntity } from '../../domain/entities/amenity-reservation.entity';
import { GetAmenityCalendarQuery } from '../queries/get-amenity-calendar.query';

export interface AmenityCalendarResult {
  amenity: AmenityEntity;
  blocks: AmenityBlockPeriodEntity[];
  reservations: AmenityReservationEntity[];
}

@Injectable()
export class GetAmenityCalendarUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenitiesRepository)
    private readonly amenitiesRepository: AmenitiesRepository,
    @Inject(PROVIDES_NAMES.AmenityReservationsRepository)
    private readonly reservationsRepository: AmenityReservationsRepository,
  ) {}

  async execute(
    query: GetAmenityCalendarQuery,
    isResident: boolean = false,
  ): Promise<AmenityCalendarResult> {
    const amenity = await this.amenitiesRepository.findById(
      query.amenityId,
      query.condominiumId,
    );

    if (!amenity) {
      throw new NotFoundException('La amenidad especificada no existe');
    }

    const start = new Date(query.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(query.endDate);
    end.setHours(23, 59, 59, 999);

    const [blocks, reservations] = await Promise.all([
      this.amenitiesRepository.findBlocks(
        query.amenityId,
        query.condominiumId,
        start,
        end,
      ),
      this.reservationsRepository.findAll({
        condominiumId: query.condominiumId,
        amenityId: query.amenityId,
        startDate: start,
        endDate: end,
      }),
    ]);

    // Si es residente, podemos sanitizar notas internas o datos sensibles de otros residentes
    const sanitizedReservations = isResident
      ? reservations.map(
          (r) =>
            new AmenityReservationEntity({
              ...r,
              adminNotes: null,
              notes: null,
            }),
        )
      : reservations;

    return {
      amenity,
      blocks,
      reservations: sanitizedReservations,
    };
  }
}
