import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export class GuardResponse {
  @ApiProperty({ example: 'usr-123' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'guardia@condofy.com' })
  @Expose()
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STAND })
  @Expose()
  role: UserRole;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  @Expose()
  status: UserStatus;

  @ApiProperty({ example: '2026-09-13T12:00:00.000Z' })
  @Expose()
  createdAt: Date;
}
