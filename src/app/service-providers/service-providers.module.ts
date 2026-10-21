import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/infrastructure/persistence/prisma/prisma.module';
import { CoreModule } from '@/core/core.module';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';

import { ServiceProvidersController } from './presentation/controllers/service-providers.controller';
import { ServiceProvidersPrismaRepository } from './infrastructure/repositories/service-providers.prisma.repository';

import { CreateServiceProviderUseCase } from './application/use-cases/create-service-provider.usecase';
import { GetServiceProvidersUseCase } from './application/use-cases/get-service-providers.usecase';
import { GetServiceProviderByIdUseCase } from './application/use-cases/get-service-provider-by-id.usecase';
import { UpdateServiceProviderUseCase } from './application/use-cases/update-service-provider.usecase';
import { DeleteServiceProviderUseCase } from './application/use-cases/delete-service-provider.usecase';
import { ToggleServiceProviderLikeUseCase } from './application/use-cases/toggle-service-provider-like.usecase';

@Module({
  imports: [PrismaModule, CoreModule],
  controllers: [ServiceProvidersController],
  providers: [
    {
      provide: PROVIDES_NAMES.ServiceProvidersRepository,
      useClass: ServiceProvidersPrismaRepository,
    },
    CreateServiceProviderUseCase,
    GetServiceProvidersUseCase,
    GetServiceProviderByIdUseCase,
    UpdateServiceProviderUseCase,
    DeleteServiceProviderUseCase,
    ToggleServiceProviderLikeUseCase,
  ],
  exports: [
    PROVIDES_NAMES.ServiceProvidersRepository,
    GetServiceProvidersUseCase,
    GetServiceProviderByIdUseCase,
  ],
})
export class ServiceProvidersModule {}
