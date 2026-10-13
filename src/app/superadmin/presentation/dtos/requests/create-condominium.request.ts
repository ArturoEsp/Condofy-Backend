import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUppercase,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SuperadminCreateCondominiumRequest {
  @ApiProperty({
    description: 'Clave única del fraccionamiento (ej: RESIDENCIAL_ALBERO)',
    example: 'RESIDENCIAL_ALBERO',
  })
  @IsString()
  @IsNotEmpty({ message: 'La clave es requerida' })
  @IsUppercase({ message: 'La clave debe estar en mayúsculas' })
  @MaxLength(50)
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'La clave solo puede contener letras mayúsculas, números y guiones bajos',
  })
  key: string;

  @ApiProperty({
    description: 'Nombre del fraccionamiento',
    example: 'Residencial Albero',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Descripción del fraccionamiento' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'URL de Google Maps' })
  @IsString()
  @IsOptional()
  googleMapsUrl?: string;

  @ApiPropertyOptional({ description: 'Dirección del fraccionamiento' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto' })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Correo de contacto' })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'ID del plan de suscripción' })
  @IsString()
  @IsOptional()
  planId?: string;

  @ApiPropertyOptional({ description: 'Indica si es un fraccionamiento de prueba/demo' })
  @IsOptional()
  isTrial?: boolean;

  @ApiPropertyOptional({ description: 'Precio mensual fijo personalizado opcional' })
  @IsOptional()
  customPriceOverride?: number;
}

