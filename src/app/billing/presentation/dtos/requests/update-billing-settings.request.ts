import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateBillingSettingsRequest {
  @ApiPropertyOptional({ example: 1500 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  defaultMonthlyFee?: number;

  @ApiPropertyOptional({ example: 'MXN' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  applyLateFee?: boolean;

  @ApiPropertyOptional({ enum: ['PERCENTAGE', 'FIXED'], example: 'PERCENTAGE' })
  @IsEnum(['PERCENTAGE', 'FIXED'])
  @IsOptional()
  lateFeeType?: 'PERCENTAGE' | 'FIXED';

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  lateFeeValue?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  gracePeriodDays?: number;

  @ApiPropertyOptional({ example: 'BBVA Bancomer' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ example: 'Condominio Las Palmas A.C.' })
  @IsString()
  @IsOptional()
  accountHolder?: string;

  @ApiPropertyOptional({ example: '012180015555555555' })
  @IsString()
  @IsOptional()
  clabe?: string;

  @ApiPropertyOptional({ example: '1555555555' })
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'CASA-[NUMERO]' })
  @IsString()
  @IsOptional()
  paymentReferenceRule?: string;

  @ApiPropertyOptional({
    example: 'Favor de reportar su pago antes del día 10',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  notifyOnPeriodStart?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  notifyDueDateReminder?: boolean;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(15)
  dueDateReminderDaysBefore?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  notifyOnProofReviewed?: boolean;

  @ApiPropertyOptional({ enum: ['ALL', 'PUSH', 'EMAIL'], example: 'ALL' })
  @IsString()
  @IsOptional()
  notificationChannel?: string;
}
