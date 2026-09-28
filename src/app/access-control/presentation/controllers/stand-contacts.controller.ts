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
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';
import { UserRole } from '@/core/infrastructure/persistence/prisma/generated/enums';

import { CreateStandContactUseCase } from '../../application/use-cases/create-stand-contact.usecase';
import { ListStandContactsUseCase } from '../../application/use-cases/list-stand-contacts.usecase';
import { UpdateStandContactUseCase } from '../../application/use-cases/update-stand-contact.usecase';
import { DeleteStandContactUseCase } from '../../application/use-cases/delete-stand-contact.usecase';

import * as Docs from '../docs/stand-contacts.docs';
import { CreateStandContactRequest } from '../dtos/requests/create-stand-contact.request';
import { UpdateStandContactRequest } from '../dtos/requests/update-stand-contact.request';

@ApiTags('Stand Contacts')
@Controller(':condominiumKey/security/contacts')
export class StandContactsController {
  constructor(
    private readonly createStandContactUseCase: CreateStandContactUseCase,
    private readonly listStandContactsUseCase: ListStandContactsUseCase,
    private readonly updateStandContactUseCase: UpdateStandContactUseCase,
    private readonly deleteStandContactUseCase: DeleteStandContactUseCase,
  ) {}

  @Post()
  @Roles('ADMIN')
  @ApiEndpoint(Docs.createStandContact)
  async create(
    @CondominiumId() condominiumId: string,
    @Body() dto: CreateStandContactRequest,
  ) {
    return await this.createStandContactUseCase.execute(condominiumId, dto);
  }

  @Get()
  @Roles('ADMIN', 'RESIDENT', 'STAND')
  @ApiEndpoint(Docs.listStandContacts)
  async list(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Query('onlyActive') onlyActive?: string,
  ) {
    const isResidentOrStand =
      user.role === UserRole.RESIDENT || user.role === UserRole.STAND;
    const filterActive =
      onlyActive !== undefined ? onlyActive === 'true' : isResidentOrStand;

    return await this.listStandContactsUseCase.execute(
      condominiumId,
      filterActive,
    );
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiEndpoint(Docs.updateStandContact)
  async update(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStandContactRequest,
  ) {
    return await this.updateStandContactUseCase.execute(condominiumId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiEndpoint(Docs.deleteStandContact)
  async delete(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ) {
    return await this.deleteStandContactUseCase.execute(condominiumId, id);
  }
}
