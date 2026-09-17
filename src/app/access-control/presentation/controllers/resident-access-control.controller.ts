import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';
import { AuthorizationStatus } from '@/core/infrastructure/persistence/prisma/generated/enums';

import * as Docs from '../docs/resident-access-control.docs';
import { CreateAccessAuthorizationRequest } from '../dtos/requests/create-access-authorization.request';
import { CreateDeliveryPassRequest } from '../dtos/requests/create-delivery-pass.request';
import { ParamsListAccessAuthorizationsRequest } from '../dtos/requests/params-list-access-authorizations.request';
import { UpdateAccessAuthorizationRequest } from '../dtos/requests/update-access-authorization.request';

import { CreateAccessAuthorizationUseCase } from '../../application/use-cases/create-access-authorization.usecase';
import { ListHouseAccessAuthorizationsUseCase } from '../../application/use-cases/list-house-access-authorizations.usecase';
import { UpdateAccessAuthorizationUseCase } from '../../application/use-cases/update-access-authorization.usecase';
import { ResidentCreateDeliveryPassUseCase } from '../../application/use-cases/resident-create-delivery-pass.usecase';
import { DeleteAccessAuthorizationUseCase } from '../../application/use-cases/delete-access-authorization.usecase';

@ApiTags('Resident Access Control')
@Controller(':condominiumKey/residents/access-authorizations')
@Roles('RESIDENT')
export class ResidentAccessControlController {
  constructor(
    private readonly createAccessAuthorizationUseCase: CreateAccessAuthorizationUseCase,
    private readonly listHouseAccessAuthorizationsUseCase: ListHouseAccessAuthorizationsUseCase,
    private readonly updateAccessAuthorizationUseCase: UpdateAccessAuthorizationUseCase,
    private readonly residentCreateDeliveryPassUseCase: ResidentCreateDeliveryPassUseCase,
    private readonly deleteAccessAuthorizationUseCase: DeleteAccessAuthorizationUseCase,
  ) {}

  @Post('quick-delivery')
  @ApiEndpoint(Docs.createQuickDeliveryPass)
  async createQuickDeliveryPass(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() dto: CreateDeliveryPassRequest,
  ) {
    return await this.residentCreateDeliveryPassUseCase.execute({
      ...dto,
      currentUserId: user.id,
      condominiumId,
    });
  }

  @Post()
  @ApiEndpoint(Docs.createAccessAuthorization)
  async create(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() dto: CreateAccessAuthorizationRequest,
  ) {
    return await this.createAccessAuthorizationUseCase.execute({
      ...dto,
      currentUserId: user.id,
      condominiumId,
    });
  }

  @Get()
  @ApiEndpoint(Docs.listAccessAuthorizations)
  async list(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Query() query: ParamsListAccessAuthorizationsRequest,
  ) {
    return await this.listHouseAccessAuthorizationsUseCase.execute({
      currentUserId: user.id,
      condominiumId,
      status: query.status,
      type: query.type,
      insideCondo: query.insideCondo,
      search: query.search,
      page: query.page,
      size: query.size,
      orderBy: query.orderBy,
    });
  }

  @Patch(':id')
  @ApiEndpoint(Docs.updateAccessAuthorization)
  async update(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
    @Body() dto: UpdateAccessAuthorizationRequest,
  ) {
    return await this.updateAccessAuthorizationUseCase.execute({
      id,
      currentUserId: user.id,
      condominiumId,
      status: dto.status,
      vehiclePlate: dto.vehiclePlate,
      validUntil: dto.validUntil,
      notes: dto.notes,
    });
  }

  @Patch(':id/revoke')
  @ApiEndpoint(Docs.revokeAccessAuthorization)
  async revoke(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
  ) {
    return await this.updateAccessAuthorizationUseCase.execute({
      id,
      currentUserId: user.id,
      condominiumId,
      status: AuthorizationStatus.CANCELLED,
    });
  }

  @Delete(':id')
  @ApiEndpoint(Docs.deleteAccessAuthorization)
  async delete(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
  ) {
    return await this.deleteAccessAuthorizationUseCase.execute({
      id,
      currentUserId: user.id,
      condominiumId,
    });
  }
}
