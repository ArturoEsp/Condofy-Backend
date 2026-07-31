import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateCondominiumUseCase } from '../../application/use-cases/create-condominium.usecase';
import { CreateCondominiumRequest } from '../dtos/requests/create-condominium.request';

import * as Docs from '../docs/condominiums.docs';
import { GetCondominiumByKeyUseCase } from '../../application/use-cases/get-condominium-by-key.usecase';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';

@Controller('condominiums')
export class CondominiumsController {
  constructor(
    private readonly createCondominiumUseCase: CreateCondominiumUseCase,
    private readonly getCondominiumByKeyUseCase: GetCondominiumByKeyUseCase,
  ) {}

  @Post('')
  @ApiEndpoint(Docs.createCondominium)
  async create(@Body() data: CreateCondominiumRequest) {
    await this.createCondominiumUseCase.execute(data);
  }

  @Get('key/:key')
  @ApiEndpoint(Docs.getCondominiumByKey)
  async getByKey(@Param('key') key: string) {
    return await this.getCondominiumByKeyUseCase.execute(key);
  }
}
