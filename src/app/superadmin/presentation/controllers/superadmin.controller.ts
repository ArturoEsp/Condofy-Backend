import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';

import { SuperadminListCondominiumsUseCase } from '../../application/use-cases/list-condominiums.usecase';
import { SuperadminCreateCondominiumUseCase } from '../../application/use-cases/create-condominium.usecase';
import { SuperadminListAdminsUseCase } from '../../application/use-cases/list-admins.usecase';
import { SuperadminCreateAdminUseCase } from '../../application/use-cases/create-admin.usecase';
import { SuperadminDeleteAdminUseCase } from '../../application/use-cases/delete-admin.usecase';

import { SuperadminListPlansUseCase } from '../../application/use-cases/list-plans.usecase';
import { SuperadminUpdateCondominiumUseCase } from '../../application/use-cases/update-condominium.usecase';

import { SuperadminCreateCondominiumRequest } from '../dtos/requests/create-condominium.request';
import { SuperadminUpdateCondominiumRequest } from '../dtos/requests/update-condominium.request';
import { SuperadminCreateAdminRequest } from '../dtos/requests/create-admin.request';

@ApiTags('Superadmin')
@ApiBearerAuth()
@Controller('superadmin')
@Roles('SUPERADMIN')
export class SuperadminController {
  constructor(
    private readonly listCondominiumsUseCase: SuperadminListCondominiumsUseCase,
    private readonly createCondominiumUseCase: SuperadminCreateCondominiumUseCase,
    private readonly updateCondominiumUseCase: SuperadminUpdateCondominiumUseCase,
    private readonly listAdminsUseCase: SuperadminListAdminsUseCase,
    private readonly createAdminUseCase: SuperadminCreateAdminUseCase,
    private readonly deleteAdminUseCase: SuperadminDeleteAdminUseCase,
    private readonly listPlansUseCase: SuperadminListPlansUseCase,
  ) {}

  // ────────────────── Planes de Suscripción ──────────────────

  @Get('plans')
  @ApiOperation({ summary: 'Listar planes de suscripción disponibles' })
  async listPlans() {
    return await this.listPlansUseCase.execute();
  }

  // ────────────────── Fraccionamientos ──────────────────

  @Get('condominiums')
  @ApiOperation({ summary: 'Listar todos los fraccionamientos' })
  async listCondominiums() {
    return await this.listCondominiumsUseCase.execute();
  }

  @Post('condominiums')
  @ApiOperation({ summary: 'Crear un nuevo fraccionamiento' })
  async createCondominium(@Body() dto: SuperadminCreateCondominiumRequest) {
    return await this.createCondominiumUseCase.execute(dto);
  }

  @Put('condominiums/:id')
  @ApiOperation({ summary: 'Actualizar datos, plan o precio del fraccionamiento' })
  async updateCondominium(
    @Param('id') id: string,
    @Body() dto: SuperadminUpdateCondominiumRequest,
  ) {
    return await this.updateCondominiumUseCase.execute({
      id,
      ...dto,
    });
  }

  @Patch('condominiums/:id/status')
  @ApiOperation({ summary: 'Habilitar o deshabilitar un fraccionamiento' })
  async updateCondominiumStatus(
    @Param('id') id: string,
    @Body('isDisabled') isDisabled: boolean,
  ) {
    return await this.updateCondominiumUseCase.execute({
      id,
      isDisabled,
    });
  }

  // ────────────────── Admins por fraccionamiento ──────────────────

  @Get('condominiums/:condominiumId/admins')
  @ApiOperation({ summary: 'Listar admins de un fraccionamiento' })
  async listAdmins(@Param('condominiumId') condominiumId: string) {
    return await this.listAdminsUseCase.execute(condominiumId);
  }

  @Post('condominiums/:condominiumId/admins')
  @ApiOperation({ summary: 'Crear un administrador para un fraccionamiento' })
  async createAdmin(
    @Param('condominiumId') condominiumId: string,
    @Body() dto: SuperadminCreateAdminRequest,
  ) {
    return await this.createAdminUseCase.execute({
      condominiumId,
      ...dto,
    });
  }

  @Delete('condominiums/:condominiumId/admins/:adminId')
  @ApiOperation({ summary: 'Eliminar un administrador de un fraccionamiento' })
  async deleteAdmin(
    @Param('condominiumId') condominiumId: string,
    @Param('adminId') adminId: string,
  ) {
    return await this.deleteAdminUseCase.execute({
      adminId,
      condominiumId,
    });
  }
}
