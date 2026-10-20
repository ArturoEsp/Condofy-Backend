import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AmenityResponse } from './amenity.response';
import { AmenityEntity } from '../../../domain/entities/amenity.entity';

export class AmenitiesListResponse {
  @ApiProperty({ type: [AmenityResponse] })
  @Expose()
  @Type(() => AmenityResponse)
  amenities: AmenityResponse[];

  @ApiProperty({ example: 4 })
  @Expose()
  total: number;

  static fromDomain(entities: AmenityEntity[]): AmenitiesListResponse {
    const res = new AmenitiesListResponse();
    res.amenities = entities.map((e) => AmenityResponse.fromDomain(e));
    res.total = entities.length;
    return res;
  }
}
