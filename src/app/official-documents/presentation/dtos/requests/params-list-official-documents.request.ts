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
import { OfficialDocumentCategory } from '@/core/infrastructure/persistence/prisma/generated/client';

export class ParamsListOfficialDocumentsRequest {
  @ApiPropertyOptional({
    enum: OfficialDocumentCategory,
    description: 'Filtrar por categoría del documento',
  })
  @IsOptional()
  @IsEnum(OfficialDocumentCategory)
  category?: OfficialDocumentCategory;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de publicación',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Búsqueda por título o descripción',
  })
  @IsOptional()
  @IsString()
  search?: string;

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
