import { Injectable } from '@nestjs/common';
import { GeneralProviderAccessEntity } from '../../domain/entities/general-provider-access.entity';
import { GeneralProvidersRepository } from '../../domain/repositories/general-providers.repository';

export interface StandGetActiveGeneralProvidersDto {
  condominiumId: string;
  search?: string;
}

@Injectable()
export class StandGetActiveGeneralProvidersUseCase {
  constructor(
    private readonly generalProvidersRepository: GeneralProvidersRepository,
  ) {}

  async execute(
    dto: StandGetActiveGeneralProvidersDto,
  ): Promise<GeneralProviderAccessEntity[]> {
    return await this.generalProvidersRepository.findActive(
      dto.condominiumId,
      dto.search,
    );
  }
}
