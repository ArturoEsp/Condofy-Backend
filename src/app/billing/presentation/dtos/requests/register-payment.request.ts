import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterPaymentRequest {
  @ApiProperty({ description: 'ID del cargo (MaintenanceCharge ID)' })
  @IsString()
  @IsNotEmpty()
  recordId: string;

  @ApiProperty({ example: 1500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  paidAmount: number;

  @ApiProperty({ example: '2026-09-15' })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({ example: 'TRANSFER' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'SPEI-8492049' })
  @IsString()
  @IsOptional()
  transactionReference?: string;

  @ApiPropertyOptional({ example: 'Pago registrado en ventanilla' })
  @IsString()
  @IsOptional()
  adminNotes?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  generateDigitalReceipt?: boolean;

  @ApiPropertyOptional({ description: 'URL del recibo o comprobante' })
  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @ApiPropertyOptional({ example: 'recibo_101.pdf' })
  @IsString()
  @IsOptional()
  receiptFileName?: string;

  @ApiPropertyOptional({ example: 'REC-2026-001' })
  @IsString()
  @IsOptional()
  receiptFolio?: string;
}
