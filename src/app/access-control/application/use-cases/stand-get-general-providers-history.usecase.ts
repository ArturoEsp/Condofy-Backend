import { Injectable } from '@nestjs/common';
import {
  GeneralProviderCategory,
  GeneralProviderStatus,
} from '../../domain/entities/general-provider-access.entity';
import {
  GeneralProvidersRepository,
  PaginatedGeneralProvidersResult,
} from '../../domain/repositories/general-providers.repository';

export interface StandGetGeneralProvidersHistoryDto {
  condominiumId: string;
  status?: GeneralProviderStatus;
  category?: GeneralProviderCategory;
  search?: string;
  page?: number;
  size?: number;
}

@Injectable()
export class StandGetGeneralProvidersHistoryUseCase {
  constructor(
    private readonly generalProvidersRepository: GeneralProvidersRepository,
  ) {}

  async execute(
    dto: StandGetGeneralProvidersHistoryDto,
  ): Promise<PaginatedGeneralProvidersResult> {
    return await this.generalProvidersRepository.findHistory(dto);
  }
}
