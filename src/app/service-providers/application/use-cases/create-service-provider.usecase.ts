import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { ServiceProvidersRepository } from '../../domain/repositories/service-providers.repository';
import { ServiceProviderEntity } from '../../domain/entities/service-provider.entity';
import { CreateServiceProviderCommand } from '../commands/create-service-provider.command';

@Injectable()
export class CreateServiceProviderUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.ServiceProvidersRepository)
    private readonly repository: ServiceProvidersRepository,
  ) {}

  async execute(
    command: CreateServiceProviderCommand,
  ): Promise<ServiceProviderEntity> {
    return this.repository.create({
      condominiumId: command.condominiumId,
      name: command.name,
      description: command.description,
      category: command.category,
      type: command.type,
      imageUrl: command.imageUrl,
      phone: command.phone,
      whatsapp: command.whatsapp,
      email: command.email,
      website: command.website,
      schedule: command.schedule,
      address: command.address,
      isActive: command.isActive,
      createdById: command.createdById,
    });
  }
}
