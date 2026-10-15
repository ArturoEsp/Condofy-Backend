import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetSecurityReportRequest {
  @ApiPropertyOptional({
    description: 'Fecha de inicio del reporte (YYYY-MM-DD)',
    example: '2026-10-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha final del reporte (YYYY-MM-DD)',
    example: '2026-10-14',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de registro',
    enum: ['ALL', 'VISITS', 'PARCELS', 'PROVIDERS'],
    default: 'ALL',
  })
  @IsOptional()
  @IsString()
  type?: 'ALL' | 'VISITS' | 'PARCELS' | 'PROVIDERS';

  @ApiPropertyOptional({
    description: 'Filtrar por ID de vivienda específica',
  })
  @IsOptional()
  @IsString()
  houseId?: string;

  @ApiPropertyOptional({
    description: 'Término de búsqueda libre',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
