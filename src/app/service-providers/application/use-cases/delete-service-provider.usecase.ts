import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { ServiceProvidersRepository } from '../../domain/repositories/service-providers.repository';
import { DeleteServiceProviderCommand } from '../commands/delete-service-provider.command';

@Injectable()
export class DeleteServiceProviderUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.ServiceProvidersRepository)
    private readonly repository: ServiceProvidersRepository,
  ) {}

  async execute(command: DeleteServiceProviderCommand): Promise<void> {
    await this.repository.delete(command.id, command.condominiumId);
  }
}
