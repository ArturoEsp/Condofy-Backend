import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  PublicPassHouseResponse,
  PublicPassVisitorResponse,
} from './public-pass.response';

export class ActiveEntryResponse {
  @ApiProperty({ example: 'f5127271-9f93-410e-84b2-c0e86a01b22e' })
  @Expose()
  accessAuthorizationId: string;

  @ApiProperty({ example: 'ACC-0001' })
  @Expose()
  code: string;

  @ApiProperty({ example: '839102' })
  @Expose()
  pin: string;

  @ApiProperty({ example: 'ONE_TIME' })
  @Expose()
  type: string;

  @ApiProperty({ example: 'ACTIVE' })
  @Expose()
  status: string;

  @ApiPropertyOptional({ example: 'XYZ-789-A' })
  @Expose()
  vehiclePlate?: string;

  @ApiPropertyOptional({ example: 'Visita de familiar' })
  @Expose()
  notes?: string;

  @ApiPropertyOptional({ type: () => PublicPassVisitorResponse })
  @Expose()
  @Type(() => PublicPassVisitorResponse)
  visitor?: PublicPassVisitorResponse;

  @ApiPropertyOptional({ type: () => PublicPassHouseResponse })
  @Expose()
  @Type(() => PublicPassHouseResponse)
  house?: PublicPassHouseResponse;

  @ApiProperty({ example: '2026-09-17T14:30:00.000Z' })
  @Expose()
  entryDate: Date;

  @ApiPropertyOptional({ example: 'Ingresa vehículo rojo' })
  @Expose()
  entryObservations?: string;

  @ApiProperty({ example: 'log-123' })
  @Expose()
  entryLogId: string;
}
