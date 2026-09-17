import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';

import { ListAdminsUseCase } from '../../application/use-cases/list-admins.usecase';
import { CreateAdminUseCase } from '../../application/use-cases/create-admin.usecase';
import { UpdateAdminStatusUseCase } from '../../application/use-cases/update-admin-status.usecase';
import { UpdateAdminUseCase } from '../../application/use-cases/update-admin.usecase';
import { DeleteAdminUseCase } from '../../application/use-cases/delete-admin.usecase';

import { CreateAdminRequest } from '../dtos/requests/create-admin.request';
import { UpdateAdminRequest } from '../dtos/requests/update-admin.request';
import { UpdateAdminStatusRequest } from '../dtos/requests/update-admin-status.request';
import * as Docs from '../docs/admin-users.docs';

@ApiTags('Admin Users')
@Controller(':condominiumKey/admins')
@Roles('ADMIN')
export class AdminUsersController {
  constructor(
    private readonly listAdminsUseCase: ListAdminsUseCase,
    private readonly createAdminUseCase: CreateAdminUseCase,
    private readonly updateAdminStatusUseCase: UpdateAdminStatusUseCase,
    private readonly updateAdminUseCase: UpdateAdminUseCase,
    private readonly deleteAdminUseCase: DeleteAdminUseCase,
  ) {}

  @Get()
  @ApiEndpoint(Docs.listAdmins)
  async listAdmins(@CondominiumId() condominiumId: string) {
    return await this.listAdminsUseCase.execute(condominiumId);
  }

  @Post()
  @ApiEndpoint(Docs.createAdmin)
  async createAdmin(
    @CondominiumId() condominiumId: string,
    @Body() dto: CreateAdminRequest,
  ) {
    return await this.createAdminUseCase.execute(condominiumId, dto);
  }

  @Patch(':id/status')
  @ApiEndpoint(Docs.updateAdminStatus)
  async updateAdminStatus(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAdminStatusRequest,
    @CurrentUser('id') currentUserId: string,
  ) {
    return await this.updateAdminStatusUseCase.execute(
      id,
      dto.status,
      condominiumId,
      currentUserId,
    );
  }

  @Put(':id')
  @ApiEndpoint(Docs.updateAdmin)
  async updateAdmin(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAdminRequest,
  ) {
    return await this.updateAdminUseCase.execute(id, condominiumId, dto);
  }

  @Delete(':id')
  @ApiEndpoint(Docs.deleteAdmin)
  async deleteAdmin(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    return await this.deleteAdminUseCase.execute(
      id,
      condominiumId,
      currentUserId,
    );
  }
}
