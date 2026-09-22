import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BillingRecordResponse } from './billing-record.response';

export class MyBillingResponse {
  @ApiPropertyOptional({ type: () => BillingRecordResponse })
  @Expose()
  @Type(() => BillingRecordResponse)
  currentRecord: BillingRecordResponse | null;

  @ApiProperty({ type: [BillingRecordResponse] })
  @Expose()
  @Type(() => BillingRecordResponse)
  historyRecords: BillingRecordResponse[];
}
