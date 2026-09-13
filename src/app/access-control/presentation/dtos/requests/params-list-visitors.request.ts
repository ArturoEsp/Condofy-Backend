import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { VisitorCategory } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class ParamsListVisitorsRequest {
  @ApiPropertyOptional({
    description:
      'Término de búsqueda (por nombre, teléfono o placas del visitante)',
    example: 'Juan',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por categoría de visitante',
    enum: VisitorCategory,
    example: VisitorCategory.FRIEND,
  })
  @IsEnum(VisitorCategory)
  @IsOptional()
  category?: VisitorCategory;

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
