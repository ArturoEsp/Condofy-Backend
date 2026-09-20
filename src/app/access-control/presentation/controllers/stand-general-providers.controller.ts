import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';
import {
  GeneralProviderCategory,
  GeneralProviderStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

import * as Docs from '../docs/general-providers.docs';
import { RegisterGeneralProviderRequest } from '../dtos/requests/register-general-provider.request';
import { ExitGeneralProviderRequest } from '../dtos/requests/exit-general-provider.request';
import { StandRegisterGeneralProviderEntryUseCase } from '../../application/use-cases/stand-register-general-provider-entry.usecase';
import { StandRegisterGeneralProviderExitUseCase } from '../../application/use-cases/stand-register-general-provider-exit.usecase';
import { StandGetActiveGeneralProvidersUseCase } from '../../application/use-cases/stand-get-active-general-providers.usecase';
import { StandGetGeneralProvidersHistoryUseCase } from '../../application/use-cases/stand-get-general-providers-history.usecase';
import { GeneralProviderResponseMapper } from '../../infrastructure/mappers/general-provider.mapper';

@ApiTags('Stand General Providers')
@Controller(':condominiumKey/stand/general-providers')
@Roles('STAND', 'ADMIN')
export class StandGeneralProvidersController {
  constructor(
    private readonly standRegisterGeneralProviderEntryUseCase: StandRegisterGeneralProviderEntryUseCase,
    private readonly standRegisterGeneralProviderExitUseCase: StandRegisterGeneralProviderExitUseCase,
    private readonly standGetActiveGeneralProvidersUseCase: StandGetActiveGeneralProvidersUseCase,
    private readonly standGetGeneralProvidersHistoryUseCase: StandGetGeneralProvidersHistoryUseCase,
  ) {}

  @Post()
  @ApiEndpoint(Docs.standRegisterGeneralProvider)
  async registerEntry(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() dto: RegisterGeneralProviderRequest,
  ) {
    const result = await this.standRegisterGeneralProviderEntryUseCase.execute({
      condominiumId,
      entryGuardId: user.id,
      name: dto.name,
      category: dto.category,
      driverName: dto.driverName,
      vehiclePlate: dto.vehiclePlate,
      companyPhone: dto.companyPhone,
      notes: dto.notes,
      notifyResidents: dto.notifyResidents,
    });

    return {
      provider: GeneralProviderResponseMapper.toResponse(result.provider),
      notifiedResidentsCount: result.notifiedResidentsCount,
      whatsappMessage: result.whatsappMessage,
    };
  }

  @Post(':id/exit')
  @ApiEndpoint(Docs.standExitGeneralProvider)
  async registerExit(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
    @Body() dto: ExitGeneralProviderRequest,
  ) {
    const result = await this.standRegisterGeneralProviderExitUseCase.execute({
      id,
      condominiumId,
      exitGuardId: user.id,
      exitNotes: dto.exitNotes,
      notifyResidents: dto.notifyResidents,
    });

    return {
      provider: GeneralProviderResponseMapper.toResponse(result.provider),
      notifiedResidentsCount: result.notifiedResidentsCount,
      whatsappMessage: result.whatsappMessage,
    };
  }

  @Get('active')
  @ApiEndpoint(Docs.standGetActiveGeneralProviders)
  async getActive(
    @CondominiumId() condominiumId: string,
    @Query('search') search?: string,
  ) {
    const providers = await this.standGetActiveGeneralProvidersUseCase.execute({
      condominiumId,
      search,
    });

    return providers.map((p) => GeneralProviderResponseMapper.toResponse(p));
  }

  @Get()
  @ApiEndpoint(Docs.standGetGeneralProvidersHistory)
  async getHistory(
    @CondominiumId() condominiumId: string,
    @Query('status') status?: GeneralProviderStatus,
    @Query('category') category?: GeneralProviderCategory,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    const result = await this.standGetGeneralProvidersHistoryUseCase.execute({
      condominiumId,
      status,
      category,
      search,
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
    });

    return GeneralProviderResponseMapper.toListResponse(result);
  }
}
