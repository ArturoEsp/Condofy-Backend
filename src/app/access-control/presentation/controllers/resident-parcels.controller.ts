import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';
import { ParcelStatus } from '@/core/infrastructure/persistence/prisma/generated/client';
import { ResidentGetParcelsUseCase } from '../../application/use-cases/resident-get-parcels.usecase';
import { ParcelResponseMapper } from '../../infrastructure/mappers/parcel.mapper';

@ApiTags('Resident Parcels')
@Controller(':condominiumKey/residents/parcels')
@Roles('RESIDENT')
export class ResidentParcelsController {
  constructor(
    private readonly residentGetParcelsUseCase: ResidentGetParcelsUseCase,
  ) {}

  @Get()
  @ApiEndpoint({
    summary: 'Listar paquetes en custodia e historial de mi casa',
    status: 200,
    withToken: true,
  })
  async getMyParcels(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Query('status') status?: ParcelStatus,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    const result = await this.residentGetParcelsUseCase.execute({
      condominiumId,
      currentUserId: user.id,
      status,
      search,
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
    });

    return ParcelResponseMapper.toListResponse(result);
  }
}
