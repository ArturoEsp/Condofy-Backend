import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { Roles } from '@/common/decorators/roles.decorator';

import { GetCondominiumDetailsUseCase } from '../../application/use-cases/get-condominium-details.usecase';
import { UpdateCondominiumUseCase } from '../../application/use-cases/update-condominium.usecase';
import { UpdateCondominiumRequest } from '../dtos/requests/update-condominium.request';
import * as Docs from '../docs/condominiums.docs';

@ApiTags('Admin Condominium')
@Controller(':condominiumKey/condominium')
@Roles('ADMIN')
export class AdminCondominiumController {
  constructor(
    private readonly getCondominiumDetailsUseCase: GetCondominiumDetailsUseCase,
    private readonly updateCondominiumUseCase: UpdateCondominiumUseCase,
  ) {}

  @Get()
  @ApiEndpoint(Docs.getCondominiumDetails)
  async getDetails(@CondominiumId() condominiumId: string) {
    return await this.getCondominiumDetailsUseCase.execute(condominiumId);
  }

  @Put()
  @ApiEndpoint(Docs.updateCondominiumDetails)
  async updateDetails(
    @CondominiumId() condominiumId: string,
    @Body() data: UpdateCondominiumRequest,
  ) {
    return await this.updateCondominiumUseCase.execute(condominiumId, data);
  }
}
