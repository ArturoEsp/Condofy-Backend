import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';

import * as Docs from '../docs/resident-visitors.docs';
import { CreateVisitorRequest } from '../dtos/requests/create-visitor.request';
import { UpdateVisitorRequest } from '../dtos/requests/update-visitor.request';
import { ParamsListVisitorsRequest } from '../dtos/requests/params-list-visitors.request';

import { CreateVisitorUseCase } from '../../application/use-cases/create-visitor.usecase';
import { ListHouseVisitorsUseCase } from '../../application/use-cases/list-house-visitors.usecase';
import { UpdateVisitorUseCase } from '../../application/use-cases/update-visitor.usecase';
import { DeleteVisitorUseCase } from '../../application/use-cases/delete-visitor.usecase';

@ApiTags('Resident Visitors')
@Controller(':condominiumKey/residents/visitors')
@Roles('RESIDENT')
export class ResidentVisitorsController {
  constructor(
    private readonly createVisitorUseCase: CreateVisitorUseCase,
    private readonly listHouseVisitorsUseCase: ListHouseVisitorsUseCase,
    private readonly updateVisitorUseCase: UpdateVisitorUseCase,
    private readonly deleteVisitorUseCase: DeleteVisitorUseCase,
  ) {}

  @Post()
  @ApiEndpoint(Docs.createVisitor)
  async create(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() dto: CreateVisitorRequest,
  ) {
    return await this.createVisitorUseCase.execute({
      ...dto,
      currentUserId: user.id,
      condominiumId,
    });
  }

  @Get()
  @ApiEndpoint(Docs.listVisitors)
  async list(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Query() query: ParamsListVisitorsRequest,
  ) {
    return await this.listHouseVisitorsUseCase.execute({
      currentUserId: user.id,
      condominiumId,
      search: query.search,
      category: query.category,
      page: query.page,
      size: query.size,
      orderBy: query.orderBy,
    });
  }

  @Patch(':id')
  @ApiEndpoint(Docs.updateVisitor)
  async update(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
    @Body() dto: UpdateVisitorRequest,
  ) {
    return await this.updateVisitorUseCase.execute({
      id,
      ...dto,
      currentUserId: user.id,
      condominiumId,
    });
  }

  @Delete(':id')
  @ApiEndpoint(Docs.deleteVisitor)
  async delete(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
  ) {
    return await this.deleteVisitorUseCase.execute({
      id,
      currentUserId: user.id,
      condominiumId,
    });
  }
}

