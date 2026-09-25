import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BillingSettingsResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  condominiumId: string;

  @ApiProperty({ example: 1500 })
  @Expose()
  defaultMonthlyFee: number;

  @ApiProperty({ example: 'MXN' })
  @Expose()
  currency: string;

  @ApiProperty({ example: 10 })
  @Expose()
  dueDay: number;

  @ApiProperty({ example: true })
  @Expose()
  applyLateFee: boolean;

  @ApiProperty({ enum: ['PERCENTAGE', 'FIXED'], example: 'PERCENTAGE' })
  @Expose()
  lateFeeType: 'PERCENTAGE' | 'FIXED';

  @ApiProperty({ example: 10 })
  @Expose()
  lateFeeValue: number;

  @ApiProperty({ example: 2 })
  @Expose()
  gracePeriodDays: number;

  @ApiPropertyOptional({ example: 'BBVA Bancomer' })
  @Expose()
  bankName?: string | null;

  @ApiPropertyOptional({ example: 'Condominio Las Palmas A.C.' })
  @Expose()
  accountHolder?: string | null;

  @ApiPropertyOptional({ example: '012180015555555555' })
  @Expose()
  clabe?: string | null;

  @ApiPropertyOptional({ example: '1555555555' })
  @Expose()
  accountNumber?: string | null;

  @ApiPropertyOptional({ example: 'CASA-[NUMERO]' })
  @Expose()
  paymentReferenceRule?: string | null;

  @ApiPropertyOptional({
    example: 'Favor de reportar su pago antes del día 10',
  })
  @Expose()
  notes?: string | null;

  @ApiPropertyOptional({ example: true })
  @Expose()
  notifyOnPeriodStart: boolean;

  @ApiPropertyOptional({ example: true })
  @Expose()
  notifyDueDateReminder: boolean;

  @ApiPropertyOptional({ example: 3 })
  @Expose()
  dueDateReminderDaysBefore: number;

  @ApiPropertyOptional({ example: true })
  @Expose()
  notifyOnProofReviewed: boolean;

  @ApiPropertyOptional({ example: 'ALL' })
  @Expose()
  notificationChannel: string;

  @ApiPropertyOptional({ example: 50000 })
  @Expose()
  initialBalance: number;

  @ApiPropertyOptional({ example: 20000 })
  @Expose()
  initialReserveFund: number;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @Expose()
  initialBalanceDate?: Date | null;

  @ApiPropertyOptional({ example: 'Saldo inicial verificado' })
  @Expose()
  initialBalanceNotes?: string | null;
}
