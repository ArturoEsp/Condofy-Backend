import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ParamsListBillingRequest {
  @ApiPropertyOptional({
    example: '2026-09',
    description: 'Periodo en formato YYYY-MM',
  })
  @IsString()
  @IsOptional()
  period?: string;

  @ApiPropertyOptional({ example: 'PAID', description: 'Filtrar por estatus' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'Torre A', description: 'Filtrar por torre' })
  @IsString()
  @IsOptional()
  tower?: string;

  @ApiPropertyOptional({
    example: '101',
    description: 'Búsqueda por casa o residente',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
