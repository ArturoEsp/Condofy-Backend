import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserMeResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  phone: string;

  @ApiProperty()
  @Expose()
  role: string;

  @ApiProperty()
  @Expose()
  condominiumKey: string;

  @ApiProperty()
  @Expose()
  condominiumName: string;

  @ApiProperty()
  @Expose()
  updatedAt: string;
}
