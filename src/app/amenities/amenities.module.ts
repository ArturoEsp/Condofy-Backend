import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/core.module';
import { ResidentsModule } from '../residents/residents.module';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';

import { AmenitiesPrismaRepository } from './infrastructure/repositories/amenities.prisma.repository';
import { AmenityReservationsPrismaRepository } from './infrastructure/repositories/amenity-reservations.prisma.repository';

import { CreateAmenityUseCase } from './application/use-cases/create-amenity.usecase';
import { UpdateAmenityUseCase } from './application/use-cases/update-amenity.usecase';
import { DeleteAmenityUseCase } from './application/use-cases/delete-amenity.usecase';
import { GetAmenitiesAdminUseCase } from './application/use-cases/get-amenities-admin.usecase';
import { GetAmenitiesResidentUseCase } from './application/use-cases/get-amenities-resident.usecase';
import { GetAmenityByIdUseCase } from './application/use-cases/get-amenity-by-id.usecase';
import { CreateAmenityBlockUseCase } from './application/use-cases/create-amenity-block.usecase';
import { DeleteAmenityBlockUseCase } from './application/use-cases/delete-amenity-block.usecase';
import { GetAmenityCalendarUseCase } from './application/use-cases/get-amenity-calendar.usecase';
import { RequestReservationUseCase } from './application/use-cases/request-reservation.usecase';
import { GetReservationsAdminUseCase } from './application/use-cases/get-reservations-admin.usecase';
import { GetResidentReservationsUseCase } from './application/use-cases/get-resident-reservations.usecase';
import { UpdateReservationStatusUseCase } from './application/use-cases/update-reservation-status.usecase';
import { CancelReservationUseCase } from './application/use-cases/cancel-reservation.usecase';
import { GetAmenityBlocksAdminUseCase } from './application/use-cases/get-amenity-blocks-admin.usecase';
import { DeleteReservationUseCase } from './application/use-cases/delete-reservation.usecase';

import { AmenitiesAdminController } from './presentation/controllers/amenities-admin.controller';
import { AmenitiesResidentController } from './presentation/controllers/amenities-resident.controller';

@Module({
  imports: [CoreModule, ResidentsModule],
  providers: [
    {
      provide: PROVIDES_NAMES.AmenitiesRepository,
      useClass: AmenitiesPrismaRepository,
    },
    {
      provide: PROVIDES_NAMES.AmenityReservationsRepository,
      useClass: AmenityReservationsPrismaRepository,
    },
    CreateAmenityUseCase,
    UpdateAmenityUseCase,
    DeleteAmenityUseCase,
    GetAmenitiesAdminUseCase,
    GetAmenitiesResidentUseCase,
    GetAmenityByIdUseCase,
    CreateAmenityBlockUseCase,
    DeleteAmenityBlockUseCase,
    GetAmenityCalendarUseCase,
    RequestReservationUseCase,
    GetReservationsAdminUseCase,
    GetResidentReservationsUseCase,
    UpdateReservationStatusUseCase,
    CancelReservationUseCase,
    GetAmenityBlocksAdminUseCase,
    DeleteReservationUseCase,
  ],
  controllers: [AmenitiesAdminController, AmenitiesResidentController],
  exports: [
    PROVIDES_NAMES.AmenitiesRepository,
    PROVIDES_NAMES.AmenityReservationsRepository,
    GetAmenitiesAdminUseCase,
    GetAmenitiesResidentUseCase,
    GetAmenityByIdUseCase,
    GetAmenityCalendarUseCase,
    RequestReservationUseCase,
  ],
})
export class AmenitiesModule {}
