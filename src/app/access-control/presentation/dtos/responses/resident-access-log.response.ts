import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { EntryType } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class ResidentAccessLogUserResponse {
  @ApiProperty({ example: 'usr-123' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Oficial Carlos Gómez' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'guardia@condofy.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'STAND' })
  @Expose()
  role: string;
}

export class ResidentAccessLogResponse {
  @ApiProperty({ example: 'log-123' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'auth-123' })
  @Expose()
  accessAuthorizationId: string;

  @ApiProperty({ enum: EntryType, example: 'ENTRY' })
  @Expose()
  entryType: EntryType;

  @ApiPropertyOptional({ example: 'Acceso peatonal por caseta principal' })
  @Expose()
  observations?: string;

  @ApiProperty({ example: '2026-09-20T14:30:00.000Z' })
  @Expose()
  date: Date;

  @ApiProperty({ type: () => ResidentAccessLogUserResponse })
  @Expose()
  @Type(() => ResidentAccessLogUserResponse)
  userAccept: ResidentAccessLogUserResponse;
}
