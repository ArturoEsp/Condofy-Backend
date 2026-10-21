import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  ServiceProviderCategory,
  ServiceProviderType,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export class CreateServiceProviderRequest {
  @ApiProperty({
    description: 'Nombre o razón comercial del proveedor',
    example: 'Cerrajería y Seguridad Express',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de los servicios ofrecidos',
    example:
      'Apertura de cerraduras, duplicado de llaves con chip, servicio de emergencia.',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiProperty({
    enum: ServiceProviderCategory,
    example: ServiceProviderCategory.LOCKSMITH,
    description: 'Categoría del servicio',
  })
  @IsEnum(ServiceProviderCategory, {
    message: 'La categoría especificada no es válida',
  })
  category: ServiceProviderCategory;

  @ApiPropertyOptional({
    enum: ServiceProviderType,
    default: ServiceProviderType.COMMUNITY,
    description:
      'Tipo de proveedor: OFFICIAL (contratado por el fraccionamiento) o COMMUNITY (recomendado)',
  })
  @IsOptional()
  @IsEnum(ServiceProviderType, {
    message: 'El tipo especificado no es válido',
  })
  type?: ServiceProviderType;

  @ApiPropertyOptional({
    description: 'URL o clave de imagen/logo del proveedor',
    example: 'https://storage.condofy.com.mx/providers/cerrajeria.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Teléfono directo de contacto',
    example: '+52 55 1234 5678',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({
    description:
      'Número de WhatsApp (con lada internacional para enlace directo)',
    example: '525512345678',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico de contacto',
    example: 'contacto@cerrajeriaexpress.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El formato de correo no es válido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Página web o red social',
    example: 'https://cerrajeriaexpress.com',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({
    description: 'Horario de atención o disponibilidad',
    example: 'Lunes a Sábado 8:00 - 20:00 (Urgencias 24h)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  schedule?: string;

  @ApiPropertyOptional({
    description: 'Dirección física o zona de cobertura',
    example: 'Av. Principal #123, Col. Centro',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({
    description: 'Estado activo o visible del proveedor',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
