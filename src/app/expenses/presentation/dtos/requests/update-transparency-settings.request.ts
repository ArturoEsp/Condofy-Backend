import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTransparencySettingsRequest {
  @ApiPropertyOptional({
    description: 'Habilitar o suspender el portal de transparencia',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Permitir a residentes ver el listado de egresos',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  showExpenses?: boolean;

  @ApiPropertyOptional({
    description: 'Permitir a residentes ver el total de ingresos recaudados',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  showIncomes?: boolean;

  @ApiPropertyOptional({
    description: 'Mostrar balance neto y saldo en cuenta disponible',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  showBalance?: boolean;

  @ApiPropertyOptional({
    description: 'Mostrar nombre de proveedores en los egresos',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  showSuppliers?: boolean;

  @ApiPropertyOptional({
    description:
      'Permitir a los residentes abrir o descargar facturas y recibos',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  showInvoices?: boolean;

  @ApiPropertyOptional({
    description: 'Mostrar recibos detallados',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  showDetailedReceipts?: boolean;
}
