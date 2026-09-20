import { Injectable } from '@nestjs/common';
import { GeneralProviderAccessEntity } from '../../domain/entities/general-provider-access.entity';
import { GeneralProvidersRepository } from '../../domain/repositories/general-providers.repository';

@Injectable()
export class ResidentGetActiveGeneralProvidersUseCase {
  constructor(
    private readonly generalProvidersRepository: GeneralProvidersRepository,
  ) {}

  async execute(condominiumId: string): Promise<GeneralProviderAccessEntity[]> {
    return await this.generalProvidersRepository.findActive(condominiumId);
  }
}
