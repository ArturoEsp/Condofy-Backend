import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BillingRecordResponse } from './billing-record.response';

export class BillingRecordsResponse {
  @ApiProperty({ example: '2026-09' })
  @Expose()
  period: string;

  @ApiProperty({ example: 45 })
  @Expose()
  count: number;

  @ApiProperty({ example: 67500 })
  @Expose()
  totalCollected: number;

  @ApiProperty({ example: 72000 })
  @Expose()
  totalExpected: number;

  @ApiProperty({ example: 4500, required: false })
  @Expose()
  totalPrepaidBalance?: number;

  @ApiProperty({ example: 3, required: false })
  @Expose()
  prepaidHousesCount?: number;

  @ApiProperty({ type: [BillingRecordResponse] })
  @Expose()
  @Type(() => BillingRecordResponse)
  records: BillingRecordResponse[];
}
