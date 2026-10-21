import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import {
  ServiceProviderCategory,
  ServiceProviderType,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export class UpdateServiceProviderRequest {
  @ApiPropertyOptional({
    description: 'Nombre o razón comercial del proveedor',
    example: 'Cerrajería y Seguridad Express',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de los servicios ofrecidos',
    example:
      'Apertura de cerraduras, duplicado de llaves con chip, servicio de emergencia.',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiPropertyOptional({
    enum: ServiceProviderCategory,
    example: ServiceProviderCategory.LOCKSMITH,
    description: 'Categoría del servicio',
  })
  @IsOptional()
  @IsEnum(ServiceProviderCategory, {
    message: 'La categoría especificada no es válida',
  })
  category?: ServiceProviderCategory;

  @ApiPropertyOptional({
    enum: ServiceProviderType,
    description: 'Tipo de proveedor: OFFICIAL o COMMUNITY',
  })
  @IsOptional()
  @IsEnum(ServiceProviderType, {
    message: 'El tipo especificado no es válido',
  })
  type?: ServiceProviderType;

  @ApiPropertyOptional({
    description: 'URL o clave de imagen/logo del proveedor',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? null : value))
  @ValidateIf((_, value) => value !== null)
  @IsString()
  imageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Teléfono directo de contacto',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Número de WhatsApp',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico de contacto',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El formato de correo no es válido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Página web o red social',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({
    description: 'Horario de atención o disponibilidad',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  schedule?: string;

  @ApiPropertyOptional({
    description: 'Dirección física o zona de cobertura',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({
    description: 'Estado activo o visible del proveedor',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isActive?: boolean;
}
