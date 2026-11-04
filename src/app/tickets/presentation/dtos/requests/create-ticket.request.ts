import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  TicketCategory,
  TicketPriority,
  TicketScope,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export class TicketAttachmentInputDto {
  @ApiProperty({
    description: 'URL o Storage Key del archivo adjunto (previamente subido)',
    example: 'condominiums/condo-1/tickets/image1.jpg',
  })
  @IsString({ message: 'La URL del archivo debe ser texto' })
  @IsNotEmpty({ message: 'La URL del archivo es requerida' })
  fileUrl: string;

  @ApiPropertyOptional({
    description: 'Nombre del archivo original',
    example: 'fuga_agua.jpg',
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({
    description: 'Tamaño legible del archivo',
    example: '1.2 MB',
  })
  @IsOptional()
  @IsString()
  fileSize?: string;

  @ApiPropertyOptional({
    description: 'MIME type del archivo',
    example: 'image/jpeg',
  })
  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class CreateTicketRequest {
  @ApiProperty({
    description: 'Título descriptivo y breve del problema reportado',
    example: 'Fuga de agua en el jardín central',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es requerido' })
  @MaxLength(150, { message: 'El título no puede exceder 150 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Descripción detallada de la situación observada',
    example: 'Se observa agua brotando constantemente cerca de las tomas de riego.',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @ApiProperty({
    enum: TicketCategory,
    description: 'Categoría del reporte',
    example: TicketCategory.PLUMBING,
  })
  @IsEnum(TicketCategory, { message: 'La categoría proporcionada no es válida' })
  category: TicketCategory;

  @ApiPropertyOptional({
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
    description: 'Prioridad sugerida del problema',
  })
  @IsOptional()
  @IsEnum(TicketPriority, { message: 'La prioridad proporcionada no es válida' })
  priority?: TicketPriority;

  @ApiPropertyOptional({
    enum: TicketScope,
    default: TicketScope.COMMON_AREA,
    description: 'Alcance del reporte (área común o privativa)',
  })
  @IsOptional()
  @IsEnum(TicketScope, { message: 'El alcance proporcionado no es válido' })
  scope?: TicketScope;

  @ApiPropertyOptional({
    description: 'Ubicación física específica dentro del condominio',
    example: 'Junto a la palapa principal y bancas de descanso',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'El detalle de ubicación no puede exceder 200 caracteres' })
  locationDetail?: string;

  @ApiPropertyOptional({
    description: 'ID de la casa o departamento asociado (opcional si es reporte general)',
    example: 'uuid-house-123',
  })
  @IsOptional()
  @IsString()
  houseId?: string;

  @ApiPropertyOptional({
    description: 'Fotos adjuntas para el reporte (máximo 3 fotos)',
    type: [TicketAttachmentInputDto],
    maxItems: 3,
  })
  @IsOptional()
  @IsArray({ message: 'Los archivos adjuntos deben ser un arreglo' })
  @ArrayMaxSize(3, {
    message: 'Solo puedes subir un máximo de 3 fotos para el reporte',
  })
  @ValidateNested({ each: true })
  @Type(() => TicketAttachmentInputDto)
  attachments?: TicketAttachmentInputDto[];
}

