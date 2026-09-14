import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import {
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

import { CreateUserUseCase } from '@/app/users/application/use-cases/create-user.usecase';
import UsersRepository from '@/app/users/domain/repositories/users.repository';

import * as Docs from '../docs/admin-security.docs';
import { CreateGuardRequest } from '../dtos/requests/create-guard.request';
import { UpdateGuardStatusRequest } from '../dtos/requests/update-guard-status.request';

@ApiTags('Admin Security')
@Controller(':condominiumKey/security/guards')
@Roles('ADMIN')
export class AdminSecurityController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject(PROVIDES_NAMES.UsersRepository)
    private readonly usersRepository: UsersRepository,
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
    return await this.usersRepository.findMany({
      where: {
        role: UserRole.STAND,
        condominiumId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Patch(':id/status')
  @ApiEndpoint(Docs.updateGuardStatus)
  async updateGuardStatus(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGuardStatusRequest,
  ) {
    const user = await this.usersRepository.findOneById(id);
    if (
      !user ||
      user.condominiumId !== condominiumId ||
      user.role !== UserRole.STAND
    ) {
      throw new NotFoundException('Guardia no encontrado en este condominio.');
    }

    return await this.usersRepository.update(id, {
      status: dto.status,
    });
  }

  @Delete(':id')
  @ApiEndpoint(Docs.deleteGuard)
  async deleteGuard(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ) {
    const user = await this.usersRepository.findOneById(id);
    if (
      !user ||
      user.condominiumId !== condominiumId ||
      user.role !== UserRole.STAND
    ) {
      throw new NotFoundException('Guardia no encontrado en este condominio.');
    }

    await this.usersRepository.delete(id);
    return { success: true, message: 'Guardia eliminado exitosamente' };
  }
}
