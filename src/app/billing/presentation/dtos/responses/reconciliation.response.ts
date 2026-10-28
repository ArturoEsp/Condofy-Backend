import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ReconciledMovementResponse {
  @ApiProperty({ description: 'ID temporal del movimiento en la sesión' })
  @Expose()
  id: string;

  @ApiProperty({ example: '2026-03-05' })
  @Expose()
  fecha: string;

  @ApiProperty({ example: 'SPEI RECIBIDO CASA 14 LUIS GOMEZ' })
  @Expose()
  concepto: string;

  @ApiProperty({ example: 1500.0 })
  @Expose()
  monto: number;

  @ApiPropertyOptional({ example: 'SPEI-948201' })
  @Expose()
  referencia?: string;

  @ApiProperty({
    enum: ['MATCHED', 'AMBIGUOUS', 'UNMATCHED', 'ALREADY_REGISTERED'],
    example: 'MATCHED',
  })
  @Expose()
  matchStatus: 'MATCHED' | 'AMBIGUOUS' | 'UNMATCHED' | 'ALREADY_REGISTERED';

  @ApiPropertyOptional({
    example: 'Identificada por número de casa detectado ("14").',
  })
  @Expose()
  confidenceReason?: string;

  @ApiPropertyOptional({ description: 'ID de la casa identificada' })
  @Expose()
  suggestedHouseId?: string;

  @ApiPropertyOptional({ example: '14' })
  @Expose()
  suggestedHouseNumber?: string;

  @ApiPropertyOptional({ example: 'Luis Gómez' })
  @Expose()
  suggestedResidentName?: string;

  @ApiPropertyOptional({
    description: 'ID del cargo de mantenimiento pendiente a liquidar',
  })
  @Expose()
  suggestedChargeId?: string;

  @ApiPropertyOptional({ example: 'Mantenimiento Marzo 2026' })
  @Expose()
  chargeConcept?: string;

  @ApiPropertyOptional({ example: 1500.0 })
  @Expose()
  chargePendingAmount?: number;
}

export class ReconciliationSummaryResponse {
  @ApiProperty({ example: 45 })
  @Expose()
  matched: number;

  @ApiProperty({ example: 5 })
  @Expose()
  ambiguous: number;

  @ApiProperty({ example: 3 })
  @Expose()
  unmatched: number;

  @ApiProperty({ example: 2 })
  @Expose()
  alreadyRegistered: number;
}

export class StatementReconciliationResponse {
  @ApiPropertyOptional({ example: 'BBVA' })
  @Expose()
  banco?: string;

  @ApiPropertyOptional({ example: '**** 4920' })
  @Expose()
  cuenta?: string;

  @ApiPropertyOptional({ example: 'Marzo 2026' })
  @Expose()
  periodo?: string;

  @ApiProperty({ example: 55 })
  @Expose()
  totalMovimientos: number;

  @ApiProperty({ example: 82500.0 })
  @Expose()
  totalMontoAbonos: number;

  @ApiProperty({ type: ReconciliationSummaryResponse })
  @Expose()
  @Type(() => ReconciliationSummaryResponse)
  resumen: ReconciliationSummaryResponse;

  @ApiProperty({ type: [ReconciledMovementResponse] })
  @Expose()
  @Type(() => ReconciledMovementResponse)
  movimientos: ReconciledMovementResponse[];
}

export class ConfirmReconciliationItemResult {
  @ApiProperty()
  @Expose()
  chargeId: string;

  @ApiProperty()
  @Expose()
  success: boolean;

  @ApiPropertyOptional()
  @Expose()
  error?: string;

  @ApiPropertyOptional()
  @Expose()
  paidAmount?: number;
}

export class ConfirmReconciliationResponse {
  @ApiProperty({ example: 45 })
  @Expose()
  totalProcessed: number;

  @ApiProperty({ example: 45 })
  @Expose()
  totalSuccess: number;

  @ApiProperty({ example: 0 })
  @Expose()
  totalFailed: number;

  @ApiProperty({ type: [ConfirmReconciliationItemResult] })
  @Expose()
  @Type(() => ConfirmReconciliationItemResult)
  results: ConfirmReconciliationItemResult[];
}
