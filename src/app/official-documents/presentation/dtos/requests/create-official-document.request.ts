import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  OfficialDocumentCategory,
  DocumentTargetScope,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export class CreateOfficialDocumentRequest {
  @ApiProperty({
    description: 'Título del documento oficial',
    example: 'Reglamento Interno de Convivencia 2026',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es requerido' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción o notas complementarias del documento',
    example: 'Aprobado en la asamblea general ordinaria del 15 de enero de 2026.',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiPropertyOptional({
    enum: OfficialDocumentCategory,
    default: OfficialDocumentCategory.REGLAMENTO,
    description: 'Categoría del documento oficial',
  })
  @IsOptional()
  @IsEnum(OfficialDocumentCategory, {
    message: 'La categoría especificada no es válida',
  })
  category?: OfficialDocumentCategory;

  @ApiProperty({
    description: 'URL o clave del archivo cargado en el sistema de almacenamiento',
    example: 'https://storage.condofy.com.mx/documents/reglamento-2026.pdf',
  })
  @IsString({ message: 'La URL del archivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El archivo es requerido' })
  fileUrl: string;

  @ApiProperty({
    description: 'Nombre original del archivo',
    example: 'reglamento-interno-2026.pdf',
  })
  @IsString({ message: 'El nombre del archivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del archivo es requerido' })
  fileName: string;

  @ApiPropertyOptional({
    description: 'Tamaño del archivo en formato legible',
    example: '2.4 MB',
  })
  @IsOptional()
  @IsString()
  fileSize?: string;

  @ApiPropertyOptional({
    description: 'Tipo MIME del archivo',
    example: 'application/pdf',
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({
    description: 'Versión del documento',
    example: 'v2.1',
  })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({
    description: 'Indica si el documento está publicado y visible para residentes',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si requiere acuse de lectura y aceptación obligatoria del residente',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  requiresAcknowledgment?: boolean;

  @ApiPropertyOptional({
    enum: DocumentTargetScope,
    default: DocumentTargetScope.ALL,
    description: 'Alcance de visualización: ALL (todas las casas) o SPECIFIC_HOUSES (casas seleccionadas)',
  })
  @IsOptional()
  @IsEnum(DocumentTargetScope, {
    message: 'El alcance especificado no es válido',
  })
  targetScope?: DocumentTargetScope;

  @ApiPropertyOptional({
    type: [String],
    description: 'Lista de IDs de casas permitidas cuando targetScope es SPECIFIC_HOUSES',
    example: ['d3b07384-d113-4f4c-9f6b-0b5c15e8f4a1'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedHouseIds?: string[];

  @ApiPropertyOptional({
    description: 'Enviar notificación push a los residentes correspondientes al publicar',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  notifyResidents?: boolean;
}
