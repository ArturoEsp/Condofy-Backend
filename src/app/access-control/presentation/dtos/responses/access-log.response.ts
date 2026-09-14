import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { EntryType } from '@/core/infrastructure/persistence/prisma/generated/enums';
import {
  PublicPassHouseResponse,
  PublicPassVisitorResponse,
} from './public-pass.response';

export class AccessLogUserResponse {
  @ApiProperty({ example: 'usr-123' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'guardia@condofy.com' })
  @Expose()
  email: string;
}

export class AccessLogPassDetailResponse {
  @ApiProperty({ example: 'f5127271-9f93-410e-84b2-c0e86a01b22e' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'ACC-0001' })
  @Expose()
  code: string;

  @ApiProperty({ example: '839102' })
  @Expose()
  pin: string;

  @ApiPropertyOptional({ example: 'XYZ-789-A' })
  @Expose()
  vehiclePlate?: string;

  @ApiProperty({ example: 'ONE_TIME' })
  @Expose()
  type: string;

  @ApiProperty({ example: 'ACTIVE' })
  @Expose()
  status: string;

  @ApiPropertyOptional({ example: 'Cuidado con las mascotas' })
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
}

export class AccessLogResponse {
  @ApiProperty({ example: 'log-123' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'f5127271-9f93-410e-84b2-c0e86a01b22e' })
  @Expose()
  accessAuthorizationId: string;

  @ApiProperty({ enum: EntryType, example: EntryType.ENTRY })
  @Expose()
  entryType: EntryType;

  @ApiPropertyOptional({ example: 'Dejó identificación INE' })
  @Expose()
  observations?: string;

  @ApiProperty({ example: '2026-09-13T12:30:00.000Z' })
  @Expose()
  date: Date;

  @ApiProperty({ type: () => AccessLogUserResponse })
  @Expose()
  @Type(() => AccessLogUserResponse)
  userAccept: AccessLogUserResponse;

  @ApiProperty({ type: () => AccessLogPassDetailResponse })
  @Expose()
  @Type(() => AccessLogPassDetailResponse)
  authorization: AccessLogPassDetailResponse;
}

export class StandDashboardStatsResponse {
  @ApiProperty({
    example: 4,
    description: 'Visitantes actualmente dentro del condominio',
  })
  @Expose()
  insideCount: number;

  @ApiProperty({ example: 12, description: 'Entradas registradas hoy' })
  @Expose()
  todayEntriesCount: number;

  @ApiProperty({ example: 8, description: 'Salidas registradas hoy' })
  @Expose()
  todayExitsCount: number;
}
