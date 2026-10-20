import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAmenityBlockRequest {
  @ApiProperty({
    description:
      'Título o motivo del bloqueo de calendario (ej. Mantenimiento, Fumigación)',
    example: 'Mantenimiento de pintura',
  })
  @IsNotEmpty({ message: 'El título del bloqueo es obligatorio' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Detalle o justificación opcional del bloqueo',
    example: 'Se aplicará impermeabilizante en la techumbre',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Fecha de inicio del bloqueo (ISO string)',
    example: '2026-11-01T00:00:00.000Z',
  })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe ser una fecha válida ISO' },
  )
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del bloqueo (ISO string)',
    example: '2026-11-02T23:59:59.000Z',
  })
  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  @IsDateString(
    {},
    { message: 'La fecha de fin debe ser una fecha válida ISO' },
  )
  endDate: string;

  @ApiPropertyOptional({
    description:
      'Hora de inicio si el bloqueo es en un horario específico (HH:mm)',
    example: '08:00',
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({
    description:
      'Hora de fin si el bloqueo es en un horario específico (HH:mm)',
    example: '14:00',
  })
  @IsOptional()
  @IsString()
  endTime?: string;
}
