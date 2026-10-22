import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';

import * as docs from '../docs/amenities.docs';
import { CreateAmenityUseCase } from '../../application/use-cases/create-amenity.usecase';
import { UpdateAmenityUseCase } from '../../application/use-cases/update-amenity.usecase';
import { DeleteAmenityUseCase } from '../../application/use-cases/delete-amenity.usecase';
import { GetAmenitiesAdminUseCase } from '../../application/use-cases/get-amenities-admin.usecase';
import { GetAmenityByIdUseCase } from '../../application/use-cases/get-amenity-by-id.usecase';
import { CreateAmenityBlockUseCase } from '../../application/use-cases/create-amenity-block.usecase';
import { DeleteAmenityBlockUseCase } from '../../application/use-cases/delete-amenity-block.usecase';
import { GetAmenityCalendarUseCase } from '../../application/use-cases/get-amenity-calendar.usecase';
import { GetReservationsAdminUseCase } from '../../application/use-cases/get-reservations-admin.usecase';
import { UpdateReservationStatusUseCase } from '../../application/use-cases/update-reservation-status.usecase';
import { CancelReservationUseCase } from '../../application/use-cases/cancel-reservation.usecase';
import { GetAmenityBlocksAdminUseCase } from '../../application/use-cases/get-amenity-blocks-admin.usecase';
import { DeleteReservationUseCase } from '../../application/use-cases/delete-reservation.usecase';

import { CreateAmenityRequest } from '../dtos/requests/create-amenity.request';
import { UpdateAmenityRequest } from '../dtos/requests/update-amenity.request';
import { CreateAmenityBlockRequest } from '../dtos/requests/create-amenity-block.request';
import { ParamsGetCalendarRequest } from '../dtos/requests/params-get-calendar.request';
import { ParamsGetReservationsRequest } from '../dtos/requests/params-get-reservations.request';
import { UpdateReservationStatusRequest } from '../dtos/requests/update-reservation-status.request';

import { AmenityResponse } from '../dtos/responses/amenity.response';
import { AmenitiesListResponse } from '../dtos/responses/amenities-list.response';
import { AmenityBlockPeriodResponse } from '../dtos/responses/amenity-block-period.response';
import { AmenityCalendarResponse } from '../dtos/responses/amenity-calendar.response';
import { AmenityReservationResponse } from '../dtos/responses/amenity-reservation.response';

@ApiTags('Amenities - Admin')
@Controller(':condominiumKey/admin/amenities')
export class AmenitiesAdminController {
  constructor(
    private readonly createAmenityUseCase: CreateAmenityUseCase,
    private readonly updateAmenityUseCase: UpdateAmenityUseCase,
    private readonly deleteAmenityUseCase: DeleteAmenityUseCase,
    private readonly getAmenitiesAdminUseCase: GetAmenitiesAdminUseCase,
    private readonly getAmenityByIdUseCase: GetAmenityByIdUseCase,
    private readonly createAmenityBlockUseCase: CreateAmenityBlockUseCase,
    private readonly deleteAmenityBlockUseCase: DeleteAmenityBlockUseCase,
    private readonly getAmenityCalendarUseCase: GetAmenityCalendarUseCase,
    private readonly getReservationsAdminUseCase: GetReservationsAdminUseCase,
    private readonly updateReservationStatusUseCase: UpdateReservationStatusUseCase,
    private readonly cancelReservationUseCase: CancelReservationUseCase,
    private readonly getAmenityBlocksAdminUseCase: GetAmenityBlocksAdminUseCase,
    private readonly deleteReservationUseCase: DeleteReservationUseCase,
  ) {}

  @Post()
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.createAmenityDoc)
  async create(
    @CondominiumId() condominiumId: string,
    @Body() body: CreateAmenityRequest,
  ): Promise<AmenityResponse> {
    const amenity = await this.createAmenityUseCase.execute({
      condominiumId,
      name: body.name,
      description: body.description,
      capacity: body.capacity,
      isActive: body.isActive,
      cost: body.cost,
      requiresDeposit: body.requiresDeposit,
      depositAmount: body.depositAmount,
      rulesDocumentUrl: body.rulesDocumentUrl,
      rulesDocumentName: body.rulesDocumentName,
      rulesText: body.rulesText,
      photos: body.photos,
      reservationType: body.reservationType,
      openingTime: body.openingTime,
      closingTime: body.closingTime,
      availableDays: body.availableDays,
      minNoticeHours: body.minNoticeHours,
      maxNoticeDays: body.maxNoticeDays,
      maxHoursPerReservation: body.maxHoursPerReservation,
      requiresApproval: body.requiresApproval,
    });

    return AmenityResponse.fromDomain(amenity);
  }

  @Get()
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.getAdminAmenitiesDoc)
  async findAll(
    @CondominiumId() condominiumId: string,
  ): Promise<AmenitiesListResponse> {
    const amenities =
      await this.getAmenitiesAdminUseCase.execute(condominiumId);
    return AmenitiesListResponse.fromDomain(amenities);
  }

  @Get('reservations/list')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.getAdminReservationsDoc)
  async listReservations(
    @CondominiumId() condominiumId: string,
    @Query() query: ParamsGetReservationsRequest,
  ): Promise<AmenityReservationResponse[]> {
    const reservations = await this.getReservationsAdminUseCase.execute({
      condominiumId,
      amenityId: query.amenityId,
      houseId: query.houseId,
      residentId: query.residentId,
      status: query.status,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });

    return reservations.map((r) => AmenityReservationResponse.fromDomain(r));
  }

  @Patch('reservations/:reservationId/status')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.updateReservationStatusDoc)
  async updateReservationStatus(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('reservationId') reservationId: string,
    @Body() body: UpdateReservationStatusRequest,
  ): Promise<AmenityReservationResponse> {
    const reservation = await this.updateReservationStatusUseCase.execute({
      reservationId,
      condominiumId,
      status: body.status,
      adminNotes: body.adminNotes,
      approvedBy: user.id,
      cancelledBy: user.id,
      cancellationReason: body.cancellationReason,
      paymentStatus: body.paymentStatus,
    });

    return AmenityReservationResponse.fromDomain(reservation);
  }

  @Post('reservations/:reservationId/cancel')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.cancelReservationDoc)
  async cancelReservation(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('reservationId') reservationId: string,
    @Body('reason') reason?: string,
  ): Promise<AmenityReservationResponse> {
    const cancelled = await this.cancelReservationUseCase.execute({
      reservationId,
      condominiumId,
      cancelledByUserId: user.id,
      isResident: false,
      reason,
    });

    return AmenityReservationResponse.fromDomain(cancelled);
  }

  @Delete('reservations/:reservationId')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.deleteReservationDoc)
  async deleteReservation(
    @CondominiumId() condominiumId: string,
    @Param('reservationId') reservationId: string,
  ): Promise<{ message: string }> {
    await this.deleteReservationUseCase.execute(reservationId, condominiumId);
    return { message: 'Reservación eliminada correctamente' };
  }

  @Get('blocks/list')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.getAdminBlocksDoc)
  async listBlocks(
    @CondominiumId() condominiumId: string,
    @Query('amenityId') amenityId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<AmenityBlockPeriodResponse[]> {
    const blocks = await this.getAmenityBlocksAdminUseCase.execute(
      condominiumId,
      amenityId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return blocks.map((b) => AmenityBlockPeriodResponse.fromDomain(b));
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.getAmenityByIdDoc)
  async findById(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ): Promise<AmenityResponse> {
    const amenity = await this.getAmenityByIdUseCase.execute(id, condominiumId);
    return AmenityResponse.fromDomain(amenity);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.updateAmenityDoc)
  async update(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body() body: UpdateAmenityRequest,
  ): Promise<AmenityResponse> {
    const updated = await this.updateAmenityUseCase.execute({
      id,
      condominiumId,
      ...body,
    });

    return AmenityResponse.fromDomain(updated);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.deleteAmenityDoc)
  async delete(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.deleteAmenityUseCase.execute(id, condominiumId);
    return { message: 'Amenidad eliminada con éxito' };
  }

  @Post(':id/blocks')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.createAmenityBlockDoc)
  async createBlock(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
    @Body() body: CreateAmenityBlockRequest,
  ): Promise<AmenityBlockPeriodResponse> {
    const block = await this.createAmenityBlockUseCase.execute({
      amenityId: id,
      condominiumId,
      title: body.title,
      reason: body.reason,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      startTime: body.startTime,
      endTime: body.endTime,
      createdBy: user.id,
    });

    return AmenityBlockPeriodResponse.fromDomain(block);
  }

  @Delete(':id/blocks/:blockId')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.deleteAmenityBlockDoc)
  async deleteBlock(
    @CondominiumId() condominiumId: string,
    @Param('blockId') blockId: string,
  ): Promise<{ message: string }> {
    await this.deleteAmenityBlockUseCase.execute(blockId, condominiumId);
    return { message: 'Bloqueo eliminado correctamente' };
  }

  @Get(':id/calendar')
  @Roles('ADMIN', 'SUPERADMIN')
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
      false,
    );

    return AmenityCalendarResponse.fromDomain(calendar);
  }
}
