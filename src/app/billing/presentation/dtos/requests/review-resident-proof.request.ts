import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewResidentProofRequest {
  @ApiProperty({ enum: ['APPROVE', 'REJECT'], example: 'APPROVE' })
  @IsEnum(['APPROVE', 'REJECT'])
  @IsNotEmpty()
  action: 'APPROVE' | 'REJECT';

  @ApiPropertyOptional({ example: 'SPEI-CONFIRMADO-1234' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({
    example: 'El monto transferido no coincide con la cuota',
  })
  @IsString()
  @IsOptional()
  rejectReason?: string;

  @ApiPropertyOptional({ example: 'REC-EXTERNO-2026-001' })
  @IsString()
  @IsOptional()
  receiptFolio?: string;

  @ApiPropertyOptional({ example: 'condominiums/condo1/payments/proof.pdf' })
  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @ApiPropertyOptional({ example: 'recibo_contable.pdf' })
  @IsString()
  @IsOptional()
  receiptFileName?: string;
}
