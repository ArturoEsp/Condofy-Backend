import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddTicketCommentRequest {
  @ApiProperty({
    description: 'Contenido del comentario o actualización',
    example: 'El técnico ya llegó al condominio y se encuentra revisando la tubería.',
  })
  @IsString({ message: 'El comentario debe ser texto' })
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  content: string;

  @ApiPropertyOptional({
    description: 'Si es TRUE, solo es visible para el equipo de administración (bitácora interna)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @ApiPropertyOptional({
    description: 'Lista opcional de URLs de imágenes o evidencias asociadas al comentario',
    type: [String],
    example: ['https://example.com/foto_reparacion.jpg'],
  })
  @IsOptional()
  attachments?: any;
}

