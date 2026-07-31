import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateResidentUseCase } from '../../application/use-cases/create-resident.usecase';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import * as Docs from '../docs/residents-condominium.docs';
import { CreateResidentInHouseRequest } from '../dtos/requests/create-resident-inhouse.request';
import { GetListResidentsUseCase } from '../../application/use-cases/get-list-residents.usecase';
import { ParamsListHousesRequest } from '@/app/houses/presentation/dtos/requests/params-list-houses.request';

@ApiTags('Residents')
@Controller(':condominiumKey/residents')
export class ResidentsCondominiumController {
  constructor(
    private readonly createResidentUseCase: CreateResidentUseCase,
    private readonly listResidentsUseCase: GetListResidentsUseCase,
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
  async listResdients(
    @CondominiumId() condominiumId: string,
    @Query() params: ParamsListHousesRequest,
  ) {
    return await this.listResidentsUseCase.execute(params, condominiumId);
  }
}
