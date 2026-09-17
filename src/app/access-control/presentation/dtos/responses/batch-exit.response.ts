import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AccessLogResponse } from './access-log.response';

export class BatchExitResponse {
  @ApiProperty({ example: true })
  @Expose()
  success: boolean;

  @ApiProperty({ example: 3, description: 'Cantidad de salidas procesadas' })
  @Expose()
  processedCount: number;

  @ApiProperty({ type: () => [AccessLogResponse] })
  @Expose()
  @Type(() => AccessLogResponse)
  logs: AccessLogResponse[];
}
