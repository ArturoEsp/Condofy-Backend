import { ApiProperty } from '@nestjs/swagger';
import { HouseResponse } from './house.response';
import { Expose, Type } from 'class-transformer';

export class ListHousesResponse {
  @ApiProperty()
  @Expose()
  count: number;

  @ApiProperty()
  @Expose()
  @Type(() => HouseResponse)
  houses: HouseResponse[];
}
