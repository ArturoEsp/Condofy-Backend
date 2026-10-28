import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ConfirmReconciledPaymentItemRequest {
  @ApiProperty({
    description: 'ID del cargo de mantenimiento (MaintenanceCharge ID)',
  })
  @IsString()
  @IsNotEmpty()
  chargeId: string;

  @ApiProperty({ example: 1500.0, description: 'Monto a aplicar al cargo' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  paidAmount: number;

  @ApiProperty({
    example: '2026-03-05',
    description: 'Fecha del pago (YYYY-MM-DD)',
  })
  @IsDateString()
  paymentDate: string;

  @ApiPropertyOptional({ example: 'SPEI', default: 'SPEI' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'SPEI-8492049' })
  @IsString()
  @IsOptional()
  transactionReference?: string;

  @ApiPropertyOptional({ example: 'Pago conciliado automáticamente' })
  @IsString()
  @IsOptional()
  adminNotes?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  generateDigitalReceipt?: boolean;
}

export class ConfirmReconciliationRequest {
  @ApiProperty({
    type: [ConfirmReconciledPaymentItemRequest],
    description: 'Lista de pagos aceptados y verificados por el administrador',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmReconciledPaymentItemRequest)
  payments: ConfirmReconciledPaymentItemRequest[];
}
