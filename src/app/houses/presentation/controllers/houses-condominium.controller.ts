import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateHouseUseCase } from '../../application/use-cases/create-house.usecase';
import * as docs from '../docs/houses.docs';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { ListHousesUseCase } from '../../application/use-cases/list-houses.usecase';
import { CreateHouseRequest } from '../dtos/requests/create-house.request';
import { ParamsListHousesRequest } from '../dtos/requests/params-list-houses.request';

@ApiTags('Houses')
@Controller(':condominiumKey/houses')
export class HousesCondominiumController {
  constructor(
    private readonly createHouseUseCase: CreateHouseUseCase,
    private readonly listHousesUseCase: ListHousesUseCase,
  ) {}

  @Post()
  @ApiEndpoint(docs.createHouse)
  async createHouse(
    @CondominiumId() condominiumId: string,
    @Body() data: CreateHouseRequest,
  ) {
    return await this.createHouseUseCase.execute({
      condominiumId: condominiumId,
      ...data,
    });
  }

  @Get('list')
  @ApiEndpoint(docs.getHouses)
  async listHouses(
    @CondominiumId() condominiumId: string,
    @Query() params: ParamsListHousesRequest,
  ) {
    return await this.listHousesUseCase.execute(params, condominiumId);
  }
}
