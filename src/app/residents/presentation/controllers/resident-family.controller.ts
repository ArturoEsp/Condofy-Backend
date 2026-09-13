import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';

import * as Docs from '../docs/family-members.docs';
import { CreateFamilyMemberRequest } from '../dtos/requests/create-family-member.request';
import { UpdateFamilyMemberRequest } from '../dtos/requests/update-family-member.request';
import { ToggleFamilyMemberStatusRequest } from '../dtos/requests/toggle-family-member-status.request';

import { CreateFamilyMemberUseCase } from '../../application/use-cases/create-family-member.usecase';
import { ListFamilyMembersUseCase } from '../../application/use-cases/list-family-members.usecase';
import { UpdateFamilyMemberUseCase } from '../../application/use-cases/update-family-member.usecase';
import { ToggleFamilyMemberStatusUseCase } from '../../application/use-cases/toggle-family-member-status.usecase';

@ApiTags('Resident Family Members')
@Controller(':condominiumKey/residents/family-members')
@Roles('RESIDENT')
export class ResidentFamilyController {
  constructor(
    private readonly createFamilyMemberUseCase: CreateFamilyMemberUseCase,
    private readonly listFamilyMembersUseCase: ListFamilyMembersUseCase,
    private readonly updateFamilyMemberUseCase: UpdateFamilyMemberUseCase,
    private readonly toggleFamilyMemberStatusUseCase: ToggleFamilyMemberStatusUseCase,
  ) {}

  @Post()
  @ApiEndpoint(Docs.createFamilyMember)
  async create(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() dto: CreateFamilyMemberRequest,
  ) {
    return await this.createFamilyMemberUseCase.execute({
      ...dto,
      currentUserId: user.id,
      condominiumId,
    });
  }

  @Get()
  @ApiEndpoint(Docs.listFamilyMembers)
  async list(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
  ) {
    return await this.listFamilyMembersUseCase.execute(user.id, condominiumId);
  }

  @Patch(':id')
  @ApiEndpoint(Docs.updateFamilyMember)
  async update(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
    @Body() dto: UpdateFamilyMemberRequest,
  ) {
    return await this.updateFamilyMemberUseCase.execute({
      ...dto,
      currentUserId: user.id,
      familyMemberId: id,
      condominiumId,
    });
  }

  @Patch(':id/status')
  @ApiEndpoint(Docs.toggleFamilyMemberStatus)
  async toggleStatus(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
    @Body() dto: ToggleFamilyMemberStatusRequest,
  ) {
    return await this.toggleFamilyMemberStatusUseCase.execute({
      currentUserId: user.id,
      familyMemberId: id,
      condominiumId,
      isActive: dto.isActive,
    });
  }
}
