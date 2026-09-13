import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AuthorizationStatus } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class UpdateAccessAuthorizationRequest {
  @ApiPropertyOptional({
    enum: AuthorizationStatus,
    example: AuthorizationStatus.CANCELLED,
    description:
      'Actualizar estado del acceso (ej. CANCELLED para revocar el acceso)',
  })
  @IsEnum(AuthorizationStatus)
  @IsOptional()
  status?: AuthorizationStatus;

  @ApiPropertyOptional({
    example: '2026-09-12T23:59:59.000Z',
    description: 'Nueva fecha y hora límite de validez del acceso',
  })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiPropertyOptional({
    example: 'ABC-123-D',
    description: 'Placa del vehículo en el que ingresa el visitante',
  })
  @IsString()
  @IsOptional()
  vehiclePlate?: string;

  @ApiPropertyOptional({
    example: 'Acceso revocado por el residente / extensión autorizada',
    description: 'Notas o comentarios sobre la actualización',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
