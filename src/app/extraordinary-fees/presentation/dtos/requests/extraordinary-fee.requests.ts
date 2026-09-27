import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateExtraordinaryFeeRequest {
  @ApiProperty({ example: 'Impermeabilización General de Azoteas 2026' })
  @IsString()
  title: string;

  @ApiProperty({
    example:
      'Debido a las lluvias pasadas y acuerdo de asamblea del 15 de Septiembre, se aprobó la impermeabilización de todas las torres.',
  })
  @IsString()
  description: string;

  @ApiProperty({ example: 1800.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amountPerHouse: number;

  @ApiPropertyOptional({ example: 72000.0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  totalTargetAmount?: number;

  @ApiProperty({ example: '2026-11-30' })
  @IsString()
  dueDate: string;

  @ApiPropertyOptional({ example: false })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  useCustomBankAccount?: boolean;

  @ApiPropertyOptional({ example: 'BBVA' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ example: 'Comité de Obras Residencial Albero' })
  @IsString()
  @IsOptional()
  accountHolder?: string;

  @ApiPropertyOptional({ example: '012180001234567890' })
  @IsString()
  @IsOptional()
  clabe?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'Poner número de casa como concepto' })
  @IsString()
  @IsOptional()
  paymentReferenceRule?: string;

  @ApiPropertyOptional({
    description:
      'Títulos descriptivos para cada documento o cotización adjunta',
    example: ['Cotización ProTech', 'Cotización Impermeabilizantes del Norte'],
  })
  @IsOptional()
  documentTitles?: string[] | string;
}

export class RegisterExtraordinaryFeePaymentRequest {
  @ApiProperty({ example: 1800.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  paidAmount: number;

  @ApiProperty({ example: '2026-10-05' })
  @IsString()
  paymentDate: string;

  @ApiProperty({ example: 'TRANSFER' })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'SPEI-874291' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ example: 'Pago liquidado en administración' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  receiptFolio?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  receiptFileName?: string;
}

export class UploadExtraordinaryFeeProofRequest {
  @ApiPropertyOptional({ example: 'TRF-992123' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ example: 'Transferencia realizada desde BBVA' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  proofUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  proofFileName?: string;
}

export class ReviewExtraordinaryFeeProofRequest {
  @ApiProperty({ enum: ['APPROVE', 'REJECT'], example: 'APPROVE' })
  @IsString()
  action: 'APPROVE' | 'REJECT';

  @ApiPropertyOptional({ example: 'TRF-992123' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ example: 'Comprobante borroso, favor de reenviar' })
  @IsString()
  @IsOptional()
  rejectReason?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  receiptFolio?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  receiptFileName?: string;
}
