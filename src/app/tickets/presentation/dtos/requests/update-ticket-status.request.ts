import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  TicketPriority,
  TicketStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export class UpdateTicketStatusRequest {
  @ApiProperty({
    enum: TicketStatus,
    description: 'Nuevo estatus del ticket',
    example: TicketStatus.IN_PROGRESS,
  })
  @IsEnum(TicketStatus, { message: 'El estatus proporcionado no es válido' })
  @IsNotEmpty({ message: 'El estatus es requerido' })
  status: TicketStatus;

  @ApiPropertyOptional({
    enum: TicketPriority,
    description: 'Actualización opcional de la prioridad',
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({
    description: 'Nota explicativa del cambio de estatus para la bitácora',
    example: 'Se solicitó al equipo técnico acudir a inspeccionar fuga de agua.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

