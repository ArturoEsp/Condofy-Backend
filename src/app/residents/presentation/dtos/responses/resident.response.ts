import {
  ResidentType,
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/browser';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResidentResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  condominiumId: string;

  @ApiProperty()
  @Expose()
  houseId: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  residentType: ResidentType;

  @ApiProperty()
  @Expose()
  role: UserRole;

  @ApiProperty()
  @Expose()
  status: UserStatus;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  phone: string | null;

  @ApiProperty()
  @Expose()
  comments: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

export class ResidentWithHouseResponse extends ResidentResponse {
  @ApiProperty()
  @Expose()
  houseNumber: string;
}
