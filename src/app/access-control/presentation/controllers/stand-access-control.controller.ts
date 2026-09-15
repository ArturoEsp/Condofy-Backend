import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';
import { EntryType } from '@/core/infrastructure/persistence/prisma/generated/enums';

import * as Docs from '../docs/stand-access-control.docs';
import { RegisterAccessLogRequest } from '../dtos/requests/register-access-log.request';
import { RegisterParcelRequest } from '../dtos/requests/register-parcel.request';
import { DeliverParcelRequest } from '../dtos/requests/deliver-parcel.request';
import { NotifyParcelRequest } from '../dtos/requests/notify-parcel.request';
import { StandRegisterAccessLogUseCase } from '../../application/use-cases/stand-register-access-log.usecase';
import { StandGetAccessLogsUseCase } from '../../application/use-cases/stand-get-access-logs.usecase';
import { StandGetDashboardStatsUseCase } from '../../application/use-cases/stand-get-dashboard-stats.usecase';
import { GetPublicPassUseCase } from '../../application/use-cases/get-public-pass.usecase';
import { StandRegisterParcelUseCase } from '../../application/use-cases/stand-register-parcel.usecase';
import { StandDeliverParcelUseCase } from '../../application/use-cases/stand-deliver-parcel.usecase';
import { StandGetParcelsUseCase } from '../../application/use-cases/stand-get-parcels.usecase';
import { StandGetParcelStatsUseCase } from '../../application/use-cases/stand-get-parcel-stats.usecase';
import { StandNotifyParcelUseCase } from '../../application/use-cases/stand-notify-parcel.usecase';
import { ParcelResponseMapper } from '../../infrastructure/mappers/parcel.mapper';
import { ParcelStatus } from '@/core/infrastructure/persistence/prisma/generated/client';
import { AccessAuthorizationNotFoundException } from '../../application/exceptions/access-authorization-not-found.exception';

@ApiTags('Stand Access Control')
@Controller(':condominiumKey/stand')
@Roles('STAND', 'ADMIN')
export class StandAccessControlController {
  constructor(
    private readonly standRegisterAccessLogUseCase: StandRegisterAccessLogUseCase,
    private readonly standGetAccessLogsUseCase: StandGetAccessLogsUseCase,
    private readonly standGetDashboardStatsUseCase: StandGetDashboardStatsUseCase,
    private readonly getPublicPassUseCase: GetPublicPassUseCase,
    private readonly standRegisterParcelUseCase: StandRegisterParcelUseCase,
    private readonly standDeliverParcelUseCase: StandDeliverParcelUseCase,
    private readonly standGetParcelsUseCase: StandGetParcelsUseCase,
    private readonly standGetParcelStatsUseCase: StandGetParcelStatsUseCase,
    private readonly standNotifyParcelUseCase: StandNotifyParcelUseCase,
  ) {}

  @Post('access-logs')
  @ApiEndpoint(Docs.standRegisterAccessLog)
  async registerLog(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() dto: RegisterAccessLogRequest,
  ) {
    return await this.standRegisterAccessLogUseCase.execute({
      condominiumId,
      accessAuthorizationId: dto.accessAuthorizationId,
      entryType: dto.entryType,
      observations: dto.observations,
      userAcceptId: user.id,
    });
  }

  @Get('access-logs')
  @ApiEndpoint(Docs.standGetAccessLogs)
  async getLogs(
    @CondominiumId() condominiumId: string,
    @Query('date') date?: string,
    @Query('entryType') entryType?: EntryType,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    return await this.standGetAccessLogsUseCase.execute({
      condominiumId,
      date,
      entryType,
      search,
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
    });
  }

  @Get('stats')
  @ApiEndpoint(Docs.standGetStats)
  async getStats(@CondominiumId() condominiumId: string) {
    return await this.standGetDashboardStatsUseCase.execute(condominiumId);
  }

  @Get('passes/:identifier')
  @ApiEndpoint(Docs.standGetPass)
  async getPass(
    @CondominiumId() condominiumId: string,
    @Param('identifier') identifier: string,
  ) {
    const pass = await this.getPublicPassUseCase.execute(identifier);

    if (pass.condominium?.id && pass.condominium.id !== condominiumId) {
      throw new AccessAuthorizationNotFoundException(
        'El pase consultado no pertenece a este condominio.',
      );
    }

    return pass;
  }

  @Post('parcels')
  @ApiEndpoint(Docs.standRegisterParcel)
  async registerParcel(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() dto: RegisterParcelRequest,
  ) {
    const parcel = await this.standRegisterParcelUseCase.execute({
      condominiumId,
      houseId: dto.houseId,
      courier: dto.courier,
      customCourier: dto.customCourier,
      trackingNumber: dto.trackingNumber,
      packageCount: dto.packageCount,
      photoUrl: dto.photoUrl,
      notes: dto.notes,
      receivedById: user.id,
    });

    return ParcelResponseMapper.toResponse(parcel);
  }

  @Get('parcels')
  @ApiEndpoint(Docs.standGetParcels)
  async getParcels(
    @CondominiumId() condominiumId: string,
    @Query('status') status?: ParcelStatus,
    @Query('search') search?: string,
    @Query('houseId') houseId?: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    const result = await this.standGetParcelsUseCase.execute({
      condominiumId,
      houseId,
      status,
      search,
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
    });

    return ParcelResponseMapper.toListResponse(result);
  }

  @Get('parcels/stats')
  @ApiEndpoint(Docs.standGetParcelStats)
  async getParcelStats(@CondominiumId() condominiumId: string) {
    const stats = await this.standGetParcelStatsUseCase.execute(condominiumId);
    return ParcelResponseMapper.toStatsResponse(stats);
  }

  @Post('parcels/:id/deliver')
  @ApiEndpoint(Docs.standDeliverParcel)
  async deliverParcel(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
    @Body() dto: DeliverParcelRequest,
  ) {
    const parcel = await this.standDeliverParcelUseCase.execute({
      condominiumId,
      parcelId: id,
      pickupCode: dto.pickupCode,
      deliveredById: user.id,
      deliveredToName: dto.deliveredToName,
      deliveryNotes: dto.deliveryNotes,
    });

    return ParcelResponseMapper.toResponse(parcel);
  }

  @Post('parcels/:id/notify')
  @ApiEndpoint(Docs.standNotifyParcel)
  async notifyParcel(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
    @Body() dto: NotifyParcelRequest,
  ) {
    return await this.standNotifyParcelUseCase.execute({
      condominiumId,
      parcelId: id,
      recipientPhone: dto.recipientPhone,
      condominiumName: user.condominiumKey,
    });
  }
}
