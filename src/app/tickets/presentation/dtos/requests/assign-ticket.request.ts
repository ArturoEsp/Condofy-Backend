import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AssignTicketRequest {
  @ApiPropertyOptional({
    description: 'ID del administrador asignado para seguimiento',
    example: 'user-admin-uuid',
  })
  @IsOptional()
  @IsString()
  assignedAdminId?: string | null;

  @ApiPropertyOptional({
    description: 'ID del proveedor de servicios asignado (ServiceProvider)',
    example: 'service-provider-uuid',
  })
  @IsOptional()
  @IsString()
  providerId?: string | null;

  @ApiPropertyOptional({
    description: 'Nota de asignación para la bitácora',
    example: 'Asignado a Juan Pérez para coordinación con el proveedor.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

