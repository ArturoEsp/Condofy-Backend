import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class ExportReceiptsZipRequest {
  @ApiProperty({
    example: '2026-09',
    description: 'Periodo de facturación en formato YYYY-MM',
  })
  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'El periodo es obligatorio' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'El periodo debe tener formato YYYY-MM (ejemplo: 2026-09)',
  })
  period!: string;

  @ApiPropertyOptional({
    example: 'Torre A',
    description: 'Filtrar por torre específica (opcional)',
  })
  @Expose()
  @IsString()
  @IsOptional()
  tower?: string;
}

