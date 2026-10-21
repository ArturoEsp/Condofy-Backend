import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { ServiceProvidersRepository } from '../../domain/repositories/service-providers.repository';
import { ToggleServiceProviderLikeCommand } from '../commands/toggle-service-provider-like.command';

@Injectable()
export class ToggleServiceProviderLikeUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.ServiceProvidersRepository)
    private readonly repository: ServiceProvidersRepository,
  ) {}

  async execute(
    command: ToggleServiceProviderLikeCommand,
  ): Promise<{ hasLiked: boolean; likesCount: number }> {
    return this.repository.toggleLike(command.providerId, command.userId);
  }
}
