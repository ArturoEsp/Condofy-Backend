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
import { StandRegisterAccessLogUseCase } from '../../application/use-cases/stand-register-access-log.usecase';
import { StandGetAccessLogsUseCase } from '../../application/use-cases/stand-get-access-logs.usecase';
import { StandGetDashboardStatsUseCase } from '../../application/use-cases/stand-get-dashboard-stats.usecase';
import { GetPublicPassUseCase } from '../../application/use-cases/get-public-pass.usecase';
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
}
