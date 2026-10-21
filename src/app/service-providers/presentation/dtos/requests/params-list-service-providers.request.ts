import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  ServiceProviderCategory,
  ServiceProviderType,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export class ParamsListServiceProvidersRequest {
  @ApiPropertyOptional({
    enum: ServiceProviderCategory,
    description: 'Filtrar por categoría del servicio',
  })
  @IsOptional()
  @IsEnum(ServiceProviderCategory)
  category?: ServiceProviderCategory;

  @ApiPropertyOptional({
    enum: ServiceProviderType,
    description: 'Filtrar por tipo: OFFICIAL o COMMUNITY',
  })
  @IsOptional()
  @IsEnum(ServiceProviderType)
  type?: ServiceProviderType;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo o inactivo',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Búsqueda por nombre o descripción',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar únicamente proveedores recomendados/likeados por el usuario autenticado',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  onlyLiked?: boolean;

  @ApiPropertyOptional({
    enum: ['likes', 'recent', 'name'],
    default: 'recent',
    description: 'Criterio de ordenamiento: likes (más recomendados), recent (más recientes), name (alfabético)',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'likes' | 'recent' | 'name' = 'recent';

  @ApiPropertyOptional({
    default: 1,
    description: 'Número de página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    default: 20,
    description: 'Cantidad de elementos por página',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

