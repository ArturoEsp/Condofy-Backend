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
  OfficialDocumentCategory,
  DocumentTargetScope,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export class UpdateOfficialDocumentRequest {
  @ApiPropertyOptional({
    description: 'Título del documento oficial',
    example: 'Reglamento Interno de Convivencia 2026 (Actualizado)',
  })
  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Descripción o notas complementarias del documento',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiPropertyOptional({
    enum: OfficialDocumentCategory,
    description: 'Categoría del documento oficial',
  })
  @IsOptional()
  @IsEnum(OfficialDocumentCategory, {
    message: 'La categoría especificada no es válida',
  })
  category?: OfficialDocumentCategory;

  @ApiPropertyOptional({
    description: 'URL o clave del archivo cargado',
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({
    description: 'Nombre original del archivo',
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({
    description: 'Tamaño del archivo',
  })
  @IsOptional()
  @IsString()
  fileSize?: string;

  @ApiPropertyOptional({
    description: 'Tipo MIME del archivo',
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({
    description: 'Versión del documento',
  })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({
    description: 'Indica si el documento está publicado',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si requiere acuse de lectura y aceptación',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  requiresAcknowledgment?: boolean;

  @ApiPropertyOptional({
    enum: DocumentTargetScope,
    description: 'Alcance de visualización: ALL o SPECIFIC_HOUSES',
  })
  @IsOptional()
  @IsEnum(DocumentTargetScope, {
    message: 'El alcance especificado no es válido',
  })
  targetScope?: DocumentTargetScope;

  @ApiPropertyOptional({
    type: [String],
    description: 'Lista de IDs de casas permitidas cuando targetScope es SPECIFIC_HOUSES',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedHouseIds?: string[];

  @ApiPropertyOptional({
    description: 'Enviar notificación push a los residentes correspondientes',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  notifyResidents?: boolean;
}
