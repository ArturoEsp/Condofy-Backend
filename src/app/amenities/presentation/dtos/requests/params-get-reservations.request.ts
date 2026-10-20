import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AmenityReservationStatus } from '@/core/infrastructure/persistence/prisma/generated/client';

export class ParamsGetReservationsRequest {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de amenidad',
  })
  @IsOptional()
  @IsString()
  amenityId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de casa',
  })
  @IsOptional()
  @IsString()
  houseId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de residente',
  })
  @IsOptional()
  @IsString()
  residentId?: string;

  @ApiPropertyOptional({
    enum: AmenityReservationStatus,
    description: 'Filtrar por estatus de la reservación',
  })
  @IsOptional()
  @IsEnum(AmenityReservationStatus)
  status?: AmenityReservationStatus;

  @ApiPropertyOptional({
    description: 'Fecha mínima de reservación (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha máxima de reservación (ISO string)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
