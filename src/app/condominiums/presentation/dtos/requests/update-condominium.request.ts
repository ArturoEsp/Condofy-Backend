import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCondominiumRequest {
  @ApiPropertyOptional({ description: 'Nombre del condominio o residencial' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Descripción o amenidades del residencial',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Enlace a la ubicación en Google Maps' })
  @IsString()
  @IsOptional()
  googleMapsUrl?: string;

  @ApiPropertyOptional({ description: 'Dirección física completa' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto de la administración',
  })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Correo electrónico de contacto' })
  @IsString()
  @IsOptional()
  contactEmail?: string;
}
