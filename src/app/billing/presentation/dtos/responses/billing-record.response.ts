import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PaymentReceiptResponse {
  @ApiProperty()
  @Expose()
  receiptUrl: string;

  @ApiPropertyOptional()
  @Expose()
  fileName?: string;

  @ApiPropertyOptional()
  @Expose()
  folio?: string;

  @ApiProperty()
  @Expose()
  uploadedAt: Date;

  @ApiPropertyOptional()
  @Expose()
  uploadedBy?: string;
}

export class ResidentProofResponse {
  @ApiProperty()
  @Expose()
  proofUrl: string;

  @ApiPropertyOptional()
  @Expose()
  fileName?: string;

  @ApiProperty()
  @Expose()
  uploadedAt: Date;

  @ApiPropertyOptional()
  @Expose()
  reference?: string;

  @ApiPropertyOptional()
  @Expose()
  notes?: string;
}

export class BillingRecordResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  houseId: string;

  @ApiProperty()
  @Expose()
  houseNumber: string;

  @ApiPropertyOptional()
  @Expose()
  tower?: string;

  @ApiPropertyOptional()
  @Expose()
  residentName?: string;

  @ApiPropertyOptional()
  @Expose()
  residentEmail?: string;

  @ApiProperty({ example: '2026-09' })
  @Expose()
  period: string;

  @ApiProperty({ example: 'Cuota de Mantenimiento - Septiembre 2026' })
  @Expose()
  concept: string;

  @ApiProperty({ example: 1500 })
  @Expose()
  baseAmount: number;

  @ApiProperty({ example: 150 })
  @Expose()
  lateFeeAmount: number;

  @ApiProperty({ example: 1650 })
  @Expose()
  totalAmount: number;

  @ApiProperty({
    enum: ['PAID', 'PENDING', 'OVERDUE', 'IN_REVIEW', 'PARTIAL'],
    example: 'PAID',
  })
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  dueDate: Date;

  @ApiPropertyOptional()
  @Expose()
  paidDate?: Date | null;

  @ApiProperty({ example: 1500 })
  @Expose()
  paidAmount: number;

  @ApiPropertyOptional({ example: 'TRANSFER' })
  @Expose()
  paymentMethod?: string | null;

  @ApiPropertyOptional({ example: 'SPEI-12345678' })
  @Expose()
  transactionReference?: string | null;

  @ApiPropertyOptional({ type: () => PaymentReceiptResponse })
  @Expose()
  @Type(() => PaymentReceiptResponse)
  receipt?: PaymentReceiptResponse | null;

  @ApiPropertyOptional({ type: () => ResidentProofResponse })
  @Expose()
  @Type(() => ResidentProofResponse)
  residentProof?: ResidentProofResponse | null;

  @ApiPropertyOptional()
  @Expose()
  notes?: string | null;

  @ApiPropertyOptional({ example: 3000 })
  @Expose()
  houseCreditBalance?: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
