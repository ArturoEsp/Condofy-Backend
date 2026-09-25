import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ParamsListExpensesRequest {
  @ApiPropertyOptional({
    description: 'Periodo de consulta (YYYY-MM)',
    example: '2026-09',
  })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por categoría',
    example: 'SERVICES',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estatus',
    example: 'PAID',
    enum: ['ALL', 'PAID', 'PENDING', 'CANCELLED'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda por texto (concepto, proveedor, referencia)',
    example: 'CFE',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;
}
