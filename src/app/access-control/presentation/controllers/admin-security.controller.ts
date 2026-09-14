import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import {
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

import { CreateUserUseCase } from '@/app/users/application/use-cases/create-user.usecase';
import { ListGuardsUseCase } from '../../application/use-cases/list-guards.usecase';
import { UpdateGuardStatusUseCase } from '../../application/use-cases/update-guard-status.usecase';
import { DeleteGuardUseCase } from '../../application/use-cases/delete-guard.usecase';

import * as Docs from '../docs/admin-security.docs';
import { CreateGuardRequest } from '../dtos/requests/create-guard.request';
import { UpdateGuardStatusRequest } from '../dtos/requests/update-guard-status.request';

@ApiTags('Admin Security')
@Controller(':condominiumKey/security/guards')
@Roles('ADMIN')
export class AdminSecurityController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listGuardsUseCase: ListGuardsUseCase,
    private readonly updateGuardStatusUseCase: UpdateGuardStatusUseCase,
    private readonly deleteGuardUseCase: DeleteGuardUseCase,
  ) {}

  @Post()
  @ApiEndpoint(Docs.createGuard)
  async createGuard(
    @CondominiumId() condominiumId: string,
    @Body() dto: CreateGuardRequest,
  ) {
    return await this.createUserUseCase.execute({
      email: dto.email,
      password: dto.password,
      isEmailVerified: true,
      role: UserRole.STAND,
      status: UserStatus.ACTIVE,
      condominiumId,
    });
  }

  @Get()
  @ApiEndpoint(Docs.listGuards)
  async listGuards(@CondominiumId() condominiumId: string) {
    return await this.listGuardsUseCase.execute(condominiumId);
  }

  @Patch(':id/status')
  @ApiEndpoint(Docs.updateGuardStatus)
  async updateGuardStatus(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGuardStatusRequest,
  ) {
    return await this.updateGuardStatusUseCase.execute(
      id,
      dto.status,
      condominiumId,
    );
  }

  @Delete(':id')
  @ApiEndpoint(Docs.deleteGuard)
  async deleteGuard(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ) {
    return await this.deleteGuardUseCase.execute(id, condominiumId);
  }
}
