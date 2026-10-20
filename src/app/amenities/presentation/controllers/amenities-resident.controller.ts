import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';
import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';

import * as docs from '../docs/amenities.docs';
import { GetAmenitiesResidentUseCase } from '../../application/use-cases/get-amenities-resident.usecase';
import { GetAmenityByIdUseCase } from '../../application/use-cases/get-amenity-by-id.usecase';
import { GetAmenityCalendarUseCase } from '../../application/use-cases/get-amenity-calendar.usecase';
import { RequestReservationUseCase } from '../../application/use-cases/request-reservation.usecase';
import { GetResidentReservationsUseCase } from '../../application/use-cases/get-resident-reservations.usecase';
import { CancelReservationUseCase } from '../../application/use-cases/cancel-reservation.usecase';

import { CreateReservationRequest } from '../dtos/requests/create-reservation.request';
import { ParamsGetCalendarRequest } from '../dtos/requests/params-get-calendar.request';
import { AmenityResponse } from '../dtos/responses/amenity.response';
import { AmenitiesListResponse } from '../dtos/responses/amenities-list.response';
import { AmenityCalendarResponse } from '../dtos/responses/amenity-calendar.response';
import { AmenityReservationResponse } from '../dtos/responses/amenity-reservation.response';

@ApiTags('Amenities - Resident')
@Controller(':condominiumKey/resident/amenities')
export class AmenitiesResidentController {
  constructor(
    private readonly getAmenitiesResidentUseCase: GetAmenitiesResidentUseCase,
    private readonly getAmenityByIdUseCase: GetAmenityByIdUseCase,
    private readonly getAmenityCalendarUseCase: GetAmenityCalendarUseCase,
    private readonly requestReservationUseCase: RequestReservationUseCase,
    private readonly getResidentReservationsUseCase: GetResidentReservationsUseCase,
    private readonly cancelReservationUseCase: CancelReservationUseCase,
    @Inject(PROVIDES_NAMES.ResidentsRepository)
    private readonly residentsRepository: ResidentsRepository,
  ) {}

  @Get()
  @Roles('RESIDENT', 'ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.getResidentAmenitiesDoc)
  async findAll(
    @CondominiumId() condominiumId: string,
  ): Promise<AmenitiesListResponse> {
    const amenities =
      await this.getAmenitiesResidentUseCase.execute(condominiumId);
    return AmenitiesListResponse.fromDomain(amenities);
  }

  @Get('reservations/my')
  @Roles('RESIDENT', 'ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.getResidentReservationsDoc)
  async getMyReservations(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
  ): Promise<AmenityReservationResponse[]> {
    const reservations = await this.getResidentReservationsUseCase.execute({
      condominiumId,
      residentId: user.id,
    });

    return reservations.map((r) => AmenityReservationResponse.fromDomain(r));
  }

  @Post('reservations')
  @Roles('RESIDENT', 'ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.requestReservationDoc)
  async requestReservation(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() body: CreateReservationRequest,
  ): Promise<AmenityReservationResponse> {
    let resolvedHouseId = body.houseId;

    if (!resolvedHouseId) {
      const residentProfile = await this.residentsRepository.findOneByUserId(
        user.id,
      );
      if (!residentProfile?.houseId) {
        throw new BadRequestException(
          'No se pudo determinar la vivienda del residente solicitante. Especifica un houseId válido.',
        );
      }
      resolvedHouseId = residentProfile.houseId;
    }

    const reservation = await this.requestReservationUseCase.execute({
      amenityId: body.amenityId,
      condominiumId,
      residentId: user.id,
      houseId: resolvedHouseId,
      reservationDate: new Date(body.reservationDate),
      startTime: body.startTime,
      endTime: body.endTime,
      notes: body.notes,
    });

    return AmenityReservationResponse.fromDomain(reservation);
  }

  @Post('reservations/:reservationId/cancel')
  @Roles('RESIDENT', 'ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.cancelReservationDoc)
  async cancelReservation(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('reservationId') reservationId: string,
    @Body('reason') reason?: string,
  ): Promise<AmenityReservationResponse> {
    const isResident = user.role === 'RESIDENT';

    const cancelled = await this.cancelReservationUseCase.execute({
      reservationId,
      condominiumId,
      cancelledByUserId: user.id,
      isResident,
      reason,
    });

    return AmenityReservationResponse.fromDomain(cancelled);
  }

  @Get(':id')
  @Roles('RESIDENT', 'ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.getAmenityByIdDoc)
  async findById(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ): Promise<AmenityResponse> {
    const amenity = await this.getAmenityByIdUseCase.execute(id, condominiumId);
    return AmenityResponse.fromDomain(amenity);
  }

  @Get(':id/calendar')
  @Roles('RESIDENT', 'ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.getAmenityCalendarDoc)
  async getCalendar(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Query() query: ParamsGetCalendarRequest,
  ): Promise<AmenityCalendarResponse> {
    const calendar = await this.getAmenityCalendarUseCase.execute(
      {
        amenityId: id,
        condominiumId,
        startDate: new Date(query.startDate),
        endDate: new Date(query.endDate),
      },
      true,
    );

    return AmenityCalendarResponse.fromDomain(calendar);
  }
}
