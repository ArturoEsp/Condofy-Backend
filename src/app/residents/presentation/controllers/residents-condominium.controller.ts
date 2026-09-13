import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateResidentUseCase } from '../../application/use-cases/create-resident.usecase';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import * as Docs from '../docs/residents-condominium.docs';
import { CreateResidentInHouseRequest } from '../dtos/requests/create-resident-inhouse.request';
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
}
