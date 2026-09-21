import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateResidentUseCase } from '../../application/use-cases/create-resident.usecase';
import { AdminSendResidentResetPasswordUseCase } from '../../application/use-cases/admin-send-resident-reset-password.usecase';
import { AdminUpdateResidentPasswordUseCase } from '../../application/use-cases/admin-update-resident-password.usecase';
import { UpdateResidentUseCase } from '../../application/use-cases/update-resident.usecase';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import * as Docs from '../docs/residents-condominium.docs';
import { CreateResidentInHouseRequest } from '../dtos/requests/create-resident-inhouse.request';
import { UpdateResidentRequest } from '../dtos/requests/update-resident.request';
import { AdminUpdateResidentPasswordRequest } from '../dtos/requests/admin-update-resident-password.request';
import { GetListResidentsUseCase } from '../../application/use-cases/get-list-residents.usecase';
import { GetMyHouseUseCase } from '../../application/use-cases/get-my-house.usecase';
import { ParamsListResidentRequest } from '../dtos/requests/params-list-residents.request';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';

@ApiTags('Residents')
@Controller(':condominiumKey/residents')
export class ResidentsCondominiumController {
  constructor(
    private readonly createResidentUseCase: CreateResidentUseCase,
    private readonly listResidentsUseCase: GetListResidentsUseCase,
    private readonly getMyHouseUseCase: GetMyHouseUseCase,
    private readonly adminSendResidentResetPasswordUseCase: AdminSendResidentResetPasswordUseCase,
    private readonly adminUpdateResidentPasswordUseCase: AdminUpdateResidentPasswordUseCase,
    private readonly updateResidentUseCase: UpdateResidentUseCase,
  ) {}

  @Post()
  @ApiEndpoint(Docs.createResident)
  async createResident(
    @CondominiumId() condominiumId: string,
    @Body() data: CreateResidentInHouseRequest,
  ) {
    return await this.createResidentUseCase.execute({
      ...data,
      condominiumId,
    });
  }

  @Get('list')
  @Roles('ADMIN', 'STAND')
  @ApiEndpoint(Docs.listResidents)
  async listResidents(
    @CondominiumId() condominiumId: string,
    @Query() params: ParamsListResidentRequest,
  ) {
    return await this.listResidentsUseCase.execute(params, condominiumId);
  }

  @Get('my-house')
  @Roles('RESIDENT')
  @ApiEndpoint(Docs.getMyHouse)
  async getMyHouse(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
  ) {
    return await this.getMyHouseUseCase.execute(user.id, condominiumId);
  }

  @Post(':id/send-reset-password')
  @Roles('ADMIN')
  @ApiEndpoint(Docs.sendResidentResetPassword)
  async sendResetPassword(
    @CondominiumId() condominiumId: string,
    @Param('id') residentId: string,
  ) {
    return await this.adminSendResidentResetPasswordUseCase.execute(
      residentId,
      condominiumId,
    );
  }

  @Put(':id/password')
  @Roles('ADMIN')
  @ApiEndpoint(Docs.adminUpdateResidentPassword)
  async updatePassword(
    @CondominiumId() condominiumId: string,
    @Param('id') residentId: string,
    @Body() dto: AdminUpdateResidentPasswordRequest,
  ) {
    return await this.adminUpdateResidentPasswordUseCase.execute(
      residentId,
      condominiumId,
      dto.newPassword,
    );
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiEndpoint(Docs.updateResident)
  async updateResident(
    @CondominiumId() condominiumId: string,
    @Param('id') residentId: string,
    @Body() dto: UpdateResidentRequest,
  ) {
    return await this.updateResidentUseCase.execute(
      residentId,
      condominiumId,
      dto,
    );
  }
}
