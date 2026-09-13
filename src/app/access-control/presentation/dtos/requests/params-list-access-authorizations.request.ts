import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  AuthorizationStatus,
  AuthorizationType,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export class ParamsListAccessAuthorizationsRequest {
  @ApiPropertyOptional({
    description: 'Término de búsqueda (por nombre o teléfono del visitante)',
    example: 'Juan',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del acceso',
    enum: AuthorizationStatus,
    example: AuthorizationStatus.ACTIVE,
  })
  @IsEnum(AuthorizationStatus)
  @IsOptional()
  status?: AuthorizationStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de autorización',
    enum: AuthorizationType,
    example: AuthorizationType.ONE_TIME,
  })
  @IsEnum(AuthorizationType)
  @IsOptional()
  type?: AuthorizationType;

  @ApiPropertyOptional({
    description:
      'Filtrar por visitantes actualmente dentro del condominio (Check-in activo)',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  insideCondo?: boolean;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  size?: number = 10;

  @ApiPropertyOptional({
    description: 'Orden por fecha de creación',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
  })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  orderBy?: 'asc' | 'desc' = 'desc';
}
