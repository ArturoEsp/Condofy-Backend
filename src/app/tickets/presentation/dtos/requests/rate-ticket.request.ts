import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class RateTicketRequest {
  @ApiProperty({
    description: 'Calificación del servicio brindado (de 1 a 5 estrellas)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'La calificación debe ser un número entero' })
  @Min(1, { message: 'La calificación mínima es 1 estrella' })
  @Max(5, { message: 'La calificación máxima es 5 estrellas' })
  @IsNotEmpty({ message: 'La calificación es requerida' })
  satisfactionRating: number;

  @ApiPropertyOptional({
    description: 'Comentarios adicionales sobre la atención recibida',
    example: 'Excelente servicio, resolvieron la fuga el mismo día.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'El comentario no puede exceder 500 caracteres' })
  satisfactionComment?: string;
}

