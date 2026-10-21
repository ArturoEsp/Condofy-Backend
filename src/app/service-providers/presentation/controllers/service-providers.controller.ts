import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';

import * as docs from '../docs/service-providers.docs';

import { CreateServiceProviderUseCase } from '../../application/use-cases/create-service-provider.usecase';
import { GetServiceProvidersUseCase } from '../../application/use-cases/get-service-providers.usecase';
import { GetServiceProviderByIdUseCase } from '../../application/use-cases/get-service-provider-by-id.usecase';
import { UpdateServiceProviderUseCase } from '../../application/use-cases/update-service-provider.usecase';
import { DeleteServiceProviderUseCase } from '../../application/use-cases/delete-service-provider.usecase';
import { ToggleServiceProviderLikeUseCase } from '../../application/use-cases/toggle-service-provider-like.usecase';

import { CreateServiceProviderRequest } from '../dtos/requests/create-service-provider.request';
import { UpdateServiceProviderRequest } from '../dtos/requests/update-service-provider.request';
import { ParamsListServiceProvidersRequest } from '../dtos/requests/params-list-service-providers.request';
import { ServiceProviderResponse } from '../dtos/responses/service-provider.response';
import { ServiceProvidersListResponse } from '../dtos/responses/service-providers-list.response';
import { ToggleLikeResponse } from '../dtos/responses/toggle-like.response';

@ApiTags('Service Providers')
@Controller(':condominiumKey/service-providers')
export class ServiceProvidersController {
  constructor(
    private readonly createProviderUseCase: CreateServiceProviderUseCase,
    private readonly getProvidersUseCase: GetServiceProvidersUseCase,
    private readonly getProviderByIdUseCase: GetServiceProviderByIdUseCase,
    private readonly updateProviderUseCase: UpdateServiceProviderUseCase,
    private readonly deleteProviderUseCase: DeleteServiceProviderUseCase,
    private readonly toggleLikeUseCase: ToggleServiceProviderLikeUseCase,
  ) {}

  @Post()
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.createProvider)
  async create(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() body: CreateServiceProviderRequest,
  ): Promise<ServiceProviderResponse> {
    const provider = await this.createProviderUseCase.execute({
      condominiumId,
      name: body.name,
      description: body.description,
      category: body.category,
      type: body.type,
      imageUrl: body.imageUrl,
      phone: body.phone,
      whatsapp: body.whatsapp,
      email: body.email,
      website: body.website,
      schedule: body.schedule,
      address: body.address,
      isActive: body.isActive ?? true,
      createdById: user.id,
    });

    return ServiceProviderResponse.fromEntity(provider);
  }

  @Get()
  @Roles('ADMIN', 'SUPERADMIN', 'RESIDENT', 'STAND')
  @ApiEndpoint(docs.getProviders)
  async findAll(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Query() params: ParamsListServiceProvidersRequest,
  ): Promise<ServiceProvidersListResponse> {
    const isResidentOrStand = user.role === 'RESIDENT' || user.role === 'STAND';
    // Residents and stand guards only see active providers
    const isActive = isResidentOrStand ? true : params.isActive;

    const result = await this.getProvidersUseCase.execute({
      condominiumId,
      category: params.category,
      type: params.type,
      isActive,
      search: params.search,
      onlyLiked: params.onlyLiked,
      currentUserId: user.id,
      sortBy: params.sortBy,
      page: params.page,
      limit: params.limit,
    });

    return ServiceProvidersListResponse.fromData(result);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPERADMIN', 'RESIDENT', 'STAND')
  @ApiEndpoint(docs.getProviderById)
  async findById(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
  ): Promise<ServiceProviderResponse> {
    const provider = await this.getProviderByIdUseCase.execute({
      id,
      condominiumId,
      currentUserId: user.id,
    });

    return ServiceProviderResponse.fromEntity(provider);
  }

  @Put(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.updateProvider)
  async update(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body() body: UpdateServiceProviderRequest,
  ): Promise<ServiceProviderResponse> {
    const updated = await this.updateProviderUseCase.execute({
      id,
      condominiumId,
      name: body.name,
      description: body.description,
      category: body.category,
      type: body.type,
      imageUrl: body.imageUrl,
      phone: body.phone,
      whatsapp: body.whatsapp,
      email: body.email,
      website: body.website,
      schedule: body.schedule,
      address: body.address,
      isActive: body.isActive,
    });

    return ServiceProviderResponse.fromEntity(updated);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiEndpoint(docs.deleteProvider)
  async delete(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.deleteProviderUseCase.execute({
      id,
      condominiumId,
    });
  }

  @Post(':id/like')
  @Roles('ADMIN', 'SUPERADMIN', 'RESIDENT')
  @ApiEndpoint(docs.toggleLike)
  async toggleLike(
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
  ): Promise<ToggleLikeResponse> {
    const result = await this.toggleLikeUseCase.execute({
      providerId: id,
      userId: user.id,
    });

    return ToggleLikeResponse.fromData(result);
  }
}
