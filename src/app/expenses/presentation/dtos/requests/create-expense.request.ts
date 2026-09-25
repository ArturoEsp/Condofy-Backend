import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateExpenseRequest {
  @ApiProperty({ description: 'Concepto del gasto', example: 'Pago bimestral CFE' })
  @IsString()
  @IsNotEmpty({ message: 'El concepto del gasto es obligatorio' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  concept: string;

  @ApiPropertyOptional({ description: 'Detalle o justificación' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description?: string;

  @ApiProperty({ description: 'Monto en pesos MXN', example: 3500.5 })
  @Type(() => Number)
  @IsNumber({}, { message: 'El monto debe ser un número válido' })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  amount: number;

  @ApiProperty({ description: 'Fecha del gasto (YYYY-MM-DD)', example: '2026-09-15' })
  @IsString()
  @IsNotEmpty({ message: 'La fecha del gasto es obligatoria' })
  expenseDate: string;

  @ApiPropertyOptional({ description: 'Periodo (YYYY-MM)', example: '2026-09' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiProperty({
    description: 'Categoría del gasto',
    example: 'SERVICES',
    enum: [
      'SERVICES',
      'MAINTENANCE',
      'SECURITY',
      'CLEANING',
      'GARDENING',
      'ADMINISTRATION',
      'RESERVE_FUND',
      'OTHER',
    ],
  })
  @IsString()
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  category: string;

  @ApiProperty({
    description: 'Forma de pago',
    example: 'TRANSFER',
    enum: ['TRANSFER', 'CASH', 'SPEI', 'CARD', 'CHECK'],
  })
  @IsString()
  @IsNotEmpty({ message: 'La forma de pago es obligatoria' })
  paymentMethod: string;

  @ApiPropertyOptional({
    description: 'Estatus del gasto',
    example: 'PAID',
    enum: ['PAID', 'PENDING', 'CANCELLED'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Proveedor o beneficiario', example: 'CFE Suministrador' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  supplier?: string;

  @ApiPropertyOptional({ description: 'Folio, factura o referencia bancaria', example: 'FAC-CFE-98421' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  reference?: string;

  @ApiPropertyOptional({ description: 'URL existente si no se sube archivo directo' })
  @IsOptional()
  @IsString()
  invoiceUrl?: string;

  @ApiPropertyOptional({ description: 'Nombre del archivo comprobante' })
  @IsOptional()
  @IsString()
  invoiceFileName?: string;
}
