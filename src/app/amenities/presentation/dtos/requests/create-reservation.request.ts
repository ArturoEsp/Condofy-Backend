import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReservationRequest {
  @ApiProperty({
    description: 'ID de la amenidad a reservar',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty({ message: 'El ID de la amenidad es obligatorio' })
  @IsString()
  amenityId: string;

  @ApiPropertyOptional({
    description:
      'ID de la casa o vivienda del residente solicitante (opcional si se infiere del perfil del residente)',
    example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @IsOptional()
  @IsString()
  houseId?: string;

  @ApiProperty({
    description: 'Fecha seleccionada para la reservación (ISO string)',
    example: '2026-11-15T00:00:00.000Z',
  })
  @IsNotEmpty({ message: 'La fecha de la reservación es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe tener un formato ISO válido' })
  reservationDate: string;

  @ApiPropertyOptional({
    description:
      'Hora de inicio requerida (HH:mm) para amenidades con slots de horario',
    example: '14:00',
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({
    description:
      'Hora de término requerida (HH:mm) para amenidades con slots de horario',
    example: '18:00',
  })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({
    description:
      'Comentarios o notas adicionales del residente (ej. tipo de evento, familiares)',
    example: 'Cumpleaños familiar, aproximadamente 25 personas.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
