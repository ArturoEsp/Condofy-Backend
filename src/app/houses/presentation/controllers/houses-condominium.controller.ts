import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateHouseUseCase } from '../../application/use-cases/create-house.usecase';
import * as docs from '../docs/houses.docs';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { ListHousesUseCase } from '../../application/use-cases/list-houses.usecase';
import { CreateHouseRequest } from '../dtos/requests/create-house.request';
import { ParamsListHousesRequest } from '../dtos/requests/params-list-houses.request';
import { UpdateHouseUseCase } from '../../application/use-cases/update-house.usecase';
import { UpdateHouseRequest } from '../dtos/requests/update-house.request';

@ApiTags('Houses')
@Controller(':condominiumKey/houses')
export class HousesCondominiumController {
  constructor(
    private readonly createHouseUseCase: CreateHouseUseCase,
    private readonly listHousesUseCase: ListHousesUseCase,
    private readonly updateHouseUseCase: UpdateHouseUseCase,
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

  @Put(':id')
  @ApiEndpoint(docs.updateHouse)
  async updateHouse(
    @CondominiumId() condominiumId: string,
    @Body() data: UpdateHouseRequest,
    @Param('id') id: string,
  ) {
    return await this.updateHouseUseCase.execute(id, data, condominiumId);
  }
}
