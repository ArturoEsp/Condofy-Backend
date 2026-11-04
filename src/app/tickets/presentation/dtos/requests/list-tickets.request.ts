import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TicketScope,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export class ListTicketsRequest {
  @ApiPropertyOptional({
    enum: TicketStatus,
    description: 'Filtrar por estatus del ticket',
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({
    enum: TicketCategory,
    description: 'Filtrar por categoría del ticket',
  })
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @ApiPropertyOptional({
    enum: TicketPriority,
    description: 'Filtrar por prioridad',
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({
    enum: TicketScope,
    description: 'Filtrar por alcance (área común o privativa)',
  })
  @IsOptional()
  @IsEnum(TicketScope)
  scope?: TicketScope;

  @ApiPropertyOptional({
    description: 'Filtrar por casa específica',
  })
  @IsOptional()
  @IsString()
  houseId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por administrador asignado',
  })
  @IsOptional()
  @IsString()
  assignedAdminId?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda de texto en título, descripción, ubicación o folio (#10)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Resultados por página (máx 100)',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

