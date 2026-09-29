import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  AnnouncementCategory,
  AnnouncementPriority,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export class CreateAnnouncementRequest {
  @ApiProperty({
    description: 'Título del comunicado',
    example: 'Mantenimiento preventivo en bombas de agua potable',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es requerido' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Mensaje corto de previsualización para banners',
    example:
      'Se suspenderá temporalmente el suministro este martes de 10:00 a 14:00 hrs.',
  })
  @IsString({ message: 'El mensaje de previsualización debe ser texto' })
  @IsNotEmpty({ message: 'El mensaje de previsualización es requerido' })
  @MaxLength(300, {
    message: 'El mensaje de previsualización no puede exceder 300 caracteres',
  })
  previewMessage: string;

  @ApiProperty({
    description: 'Contenido completo en Markdown o texto enriquecido',
    example:
      'Estimados residentes: Se llevarán a cabo labores de mantenimiento...',
  })
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El contenido es requerido' })
  content: string;

  @ApiPropertyOptional({
    enum: AnnouncementCategory,
    default: AnnouncementCategory.GENERAL,
    description: 'Categoría del comunicado',
  })
  @IsOptional()
  @IsEnum(AnnouncementCategory, {
    message: 'La categoría especificada no es válida',
  })
  category?: AnnouncementCategory;

  @ApiPropertyOptional({
    enum: AnnouncementPriority,
    default: AnnouncementPriority.NORMAL,
    description: 'Prioridad y estilo visual',
  })
  @IsOptional()
  @IsEnum(AnnouncementPriority, {
    message: 'La prioridad especificada no es válida',
  })
  priority?: AnnouncementPriority;

  @ApiPropertyOptional({
    description: 'Fecha y hora de inicio de publicación (ISO string)',
    example: '2026-09-30T10:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha y hora de expiración automática (ISO string)',
    example: '2026-10-07T10:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Indica si el comunicado está activo',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

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
