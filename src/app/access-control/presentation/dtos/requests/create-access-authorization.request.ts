import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { AuthorizationType } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class CreateAccessAuthorizationRequest {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del visitante registrado en la casa',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'El visitorId es requerido.' })
  visitorId: string;

  @ApiProperty({
    enum: AuthorizationType,
    example: AuthorizationType.ONE_TIME,
    description: 'Tipo de autorización: ONE_TIME, DATE_RANGE, PERMANENT',
  })
  @IsEnum(AuthorizationType, {
    message:
      'El tipo de autorización debe ser ONE_TIME, DATE_RANGE o PERMANENT.',
  })
  @IsNotEmpty()
  type: AuthorizationType;

  @ApiPropertyOptional({
    example: '2026-09-11T18:00:00.000Z',
    description:
      'Fecha y hora de inicio de validez (opcional, por defecto fecha y hora actual)',
  })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiPropertyOptional({
    example: '2026-09-11T23:59:59.000Z',
    description:
      'Fecha y hora de fin de validez (requerido para DATE_RANGE, opcional para ONE_TIME)',
  })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Número de entradas permitidas (por defecto 1 para ONE_TIME)',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxEntries?: number;

  @ApiPropertyOptional({
    example: 'ABC-123-D',
    description: 'Placa del vehículo en el que ingresa el visitante',
  })
  @IsString()
  @IsOptional()
  vehiclePlate?: string;

  @ApiPropertyOptional({
    example: 'Viene en vehículo Ford Fiesta gris placa XYZ-123',
    description: 'Notas o indicaciones sobre el acceso',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
