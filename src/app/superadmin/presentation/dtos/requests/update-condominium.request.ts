import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SuperadminUpdateCondominiumRequest {
  @ApiPropertyOptional({ description: 'Nombre del fraccionamiento' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

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
  planId?: string | null;

  @ApiPropertyOptional({ description: 'Indica si es un fraccionamiento de prueba' })
  @IsBoolean()
  @IsOptional()
  isTrial?: boolean;

  @ApiPropertyOptional({ description: 'Precio mensual fijo personalizado opcional' })
  @IsNumber()
  @IsOptional()
  customPriceOverride?: number | null;

  @ApiPropertyOptional({ description: 'Indica si el fraccionamiento está deshabilitado' })
  @IsBoolean()
  @IsOptional()
  isDisabled?: boolean;
}

