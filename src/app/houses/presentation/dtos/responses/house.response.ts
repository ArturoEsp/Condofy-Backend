import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { ResidentResponse } from '@/app/residents/presentation/dtos/responses/resident.response';

export class HouseResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  houseNumber: string;

  @ApiProperty()
  @Expose()
  @Type(() => ResidentResponse)
  residents: ResidentResponse[];

  @ApiProperty()
  @Expose()
  tower: string | null;

  @ApiProperty()
  @Expose()
  createdAt: string;

  @ApiProperty()
  @Expose()
  updatedAt: string;
}
