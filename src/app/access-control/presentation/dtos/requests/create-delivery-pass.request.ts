import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateDeliveryPassRequest {
  @ApiProperty({
    description:
      'Empresa o servicio de delivery (ej. Uber Eats, Rappi, Didi Food, Mercado Libre, Amazon, etc.)',
    example: 'Uber Eats',
  })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales o instrucciones para caseta',
    example: 'Entregar en mano propia en puerta principal',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Placas del vehículo o motocicleta si se conocen',
    example: 'MOTO-123',
  })
  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @ApiPropertyOptional({
    description: 'Duración en horas del pase express (por defecto 2 horas)',
    example: 2,
    default: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  durationHours?: number;
}
