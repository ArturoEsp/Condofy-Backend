import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  AnnouncementCategory,
  AnnouncementPriority,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export class UpdateAnnouncementRequest {
  @ApiPropertyOptional({
    description: 'Título del comunicado',
  })
  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Mensaje corto de previsualización para banners',
  })
  @IsOptional()
  @IsString({ message: 'El mensaje de previsualización debe ser texto' })
  @MaxLength(300, {
    message: 'El mensaje de previsualización no puede exceder 300 caracteres',
  })
  previewMessage?: string;

  @ApiPropertyOptional({
    description: 'Contenido completo en Markdown o texto enriquecido',
  })
  @IsOptional()
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  content?: string;

  @ApiPropertyOptional({
    enum: AnnouncementCategory,
    description: 'Categoría del comunicado',
  })
  @IsOptional()
  @IsEnum(AnnouncementCategory, {
    message: 'La categoría especificada no es válida',
  })
  category?: AnnouncementCategory;

  @ApiPropertyOptional({
    enum: AnnouncementPriority,
    description: 'Prioridad y estilo visual',
  })
  @IsOptional()
  @IsEnum(AnnouncementPriority, {
    message: 'La prioridad especificada no es válida',
  })
  priority?: AnnouncementPriority;

  @ApiPropertyOptional({
    description: 'Fecha y hora de inicio de publicación (ISO string)',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha y hora de expiración automática (ISO string)',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Indica si el comunicado está activo',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'IDs de adjuntos existentes que se deben conservar',
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  })
  @IsArray()
  keepAttachmentIds?: string[];

  @ApiPropertyOptional({
    description: 'Nombre del autor o entidad emisora',
    example: 'Administración',
  })
  @IsOptional()
  @IsString({ message: 'El nombre del autor debe ser una cadena de texto' })
  @MaxLength(100, {
    message: 'El nombre del autor no puede exceder 100 caracteres',
  })
  authorName?: string;
}
