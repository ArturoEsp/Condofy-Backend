import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AmenityResponse } from './amenity.response';
import { AmenityBlockPeriodResponse } from './amenity-block-period.response';
import { AmenityReservationResponse } from './amenity-reservation.response';
import { AmenityCalendarResult } from '../../../application/use-cases/get-amenity-calendar.usecase';

export class AmenityCalendarResponse {
  @ApiProperty({ type: AmenityResponse })
  @Expose()
  @Type(() => AmenityResponse)
  amenity: AmenityResponse;

  @ApiProperty({ type: [AmenityBlockPeriodResponse] })
  @Expose()
  @Type(() => AmenityBlockPeriodResponse)
  blocks: AmenityBlockPeriodResponse[];

  @ApiProperty({ type: [AmenityReservationResponse] })
  @Expose()
  @Type(() => AmenityReservationResponse)
  reservations: AmenityReservationResponse[];

  static fromDomain(result: AmenityCalendarResult): AmenityCalendarResponse {
    const res = new AmenityCalendarResponse();
    res.amenity = AmenityResponse.fromDomain(result.amenity);
    res.blocks = result.blocks.map((b) => AmenityBlockPeriodResponse.fromDomain(b));
    res.reservations = result.reservations.map((r) =>
      AmenityReservationResponse.fromDomain(r),
    );
    return res;
  }
}
