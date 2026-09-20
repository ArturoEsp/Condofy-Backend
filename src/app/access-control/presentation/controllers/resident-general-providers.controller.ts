import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { Roles } from '@/common/decorators/roles.decorator';

import * as Docs from '../docs/general-providers.docs';
import { ResidentGetActiveGeneralProvidersUseCase } from '../../application/use-cases/resident-get-active-general-providers.usecase';
import { GeneralProviderResponseMapper } from '../../infrastructure/mappers/general-provider.mapper';

@ApiTags('Resident General Providers')
@Controller(':condominiumKey/residents/general-providers')
@Roles('RESIDENT')
export class ResidentGeneralProvidersController {
  constructor(
    private readonly residentGetActiveGeneralProvidersUseCase: ResidentGetActiveGeneralProvidersUseCase,
  ) {}

  @Get('active')
  @ApiEndpoint(Docs.residentGetActiveGeneralProviders)
  async getActiveInCondo(@CondominiumId() condominiumId: string) {
    const providers =
      await this.residentGetActiveGeneralProvidersUseCase.execute(
        condominiumId,
      );

    return providers.map((p) => GeneralProviderResponseMapper.toResponse(p));
  }
}
