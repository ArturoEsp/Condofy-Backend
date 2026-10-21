import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { ServiceProvidersRepository } from '../../domain/repositories/service-providers.repository';
import { ServiceProviderEntity } from '../../domain/entities/service-provider.entity';
import { GetServiceProvidersQuery } from '../queries/get-service-providers.query';

@Injectable()
export class GetServiceProvidersUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.ServiceProvidersRepository)
    private readonly repository: ServiceProvidersRepository,
  ) {}

  async execute(query: GetServiceProvidersQuery): Promise<{
    providers: ServiceProviderEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.repository.findAll({
      condominiumId: query.condominiumId,
      category: query.category,
      type: query.type,
      isActive: query.isActive,
      search: query.search,
      onlyLiked: query.onlyLiked,
      currentUserId: query.currentUserId,
      sortBy: query.sortBy,
      page: query.page,
      limit: query.limit,
    });
  }
}
