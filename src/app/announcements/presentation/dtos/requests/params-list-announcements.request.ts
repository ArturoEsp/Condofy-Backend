import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  AnnouncementCategory,
  AnnouncementPriority,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export class ParamsListAnnouncementsRequest {
  @ApiPropertyOptional({
    description: 'Filtrar por estado computado',
    enum: ['ALL', 'ACTIVE', 'SCHEDULED', 'EXPIRED', 'DRAFT'],
    default: 'ALL',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por categoría',
    enum: AnnouncementCategory,
  })
  @IsOptional()
  @IsEnum(AnnouncementCategory)
  category?: AnnouncementCategory;

  @ApiPropertyOptional({
    description: 'Filtrar por prioridad',
    enum: AnnouncementPriority,
  })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @ApiPropertyOptional({
    description: 'Término de búsqueda en título, preview o contenido',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
