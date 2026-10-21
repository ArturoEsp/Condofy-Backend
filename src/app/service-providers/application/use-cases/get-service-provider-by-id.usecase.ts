import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { ServiceProvidersRepository } from '../../domain/repositories/service-providers.repository';
import { ServiceProviderEntity } from '../../domain/entities/service-provider.entity';
import { GetServiceProviderByIdQuery } from '../queries/get-service-provider-by-id.query';

@Injectable()
export class GetServiceProviderByIdUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.ServiceProvidersRepository)
    private readonly repository: ServiceProvidersRepository,
  ) {}

  async execute(
    query: GetServiceProviderByIdQuery,
  ): Promise<ServiceProviderEntity> {
    const provider = await this.repository.findById(
      query.id,
      query.condominiumId,
      query.currentUserId,
    );
    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado');
    }
    return provider;
  }
}
