import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  AmenityReservationStatus,
  AmenityPaymentStatus,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export class UpdateReservationStatusRequest {
  @ApiProperty({
    enum: AmenityReservationStatus,
    description: 'Nuevo estatus para la reservación',
    example: AmenityReservationStatus.APPROVED,
  })
  @IsNotEmpty({ message: 'El estatus es obligatorio' })
  @IsEnum(AmenityReservationStatus, {
    message: 'El estatus no es válido',
  })
  status: AmenityReservationStatus;

  @ApiPropertyOptional({
    description:
      'Notas o comentarios del administrador (motivo de rechazo, instrucciones de acceso)',
    example: 'Aprobado. Favor de pasar a administración por las llaves.',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Motivo de cancelación (si el nuevo estatus es CANCELLED)',
    example: 'Cancelado por lluvia intensa.',
  })
  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @ApiPropertyOptional({
    enum: AmenityPaymentStatus,
    description: 'Estatus de pago de la cuota o fianza',
    example: AmenityPaymentStatus.PAID,
  })
  @IsOptional()
  @IsEnum(AmenityPaymentStatus)
  paymentStatus?: AmenityPaymentStatus;
}
