import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ServiceProviderResponse } from './service-provider.response';
import { ServiceProviderEntity } from '@/app/service-providers/domain/entities/service-provider.entity';

export class ServiceProvidersListResponse {
  @ApiProperty({ type: [ServiceProviderResponse] })
  @Expose()
  @Type(() => ServiceProviderResponse)
  providers: ServiceProviderResponse[];

  @ApiProperty({ example: 42 })
  @Expose()
  total: number;

  @ApiProperty({ example: 1 })
  @Expose()
  page: number;

  @ApiProperty({ example: 20 })
  @Expose()
  limit: number;

  static fromData(data: {
    providers: ServiceProviderEntity[];
    total: number;
    page: number;
    limit: number;
  }): ServiceProvidersListResponse {
    const res = new ServiceProvidersListResponse();
    res.providers = data.providers.map((p) => ServiceProviderResponse.fromEntity(p));
    res.total = data.total;
    res.page = data.page;
    res.limit = data.limit;
    return res;
  }
}
