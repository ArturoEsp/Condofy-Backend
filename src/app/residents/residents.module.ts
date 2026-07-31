import { Module } from '@nestjs/common';

import { ResidentsPrismaRepository } from './infrastructure/repositories/residents.prisma.repository';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { UsersModule } from '../users/users.module';
import { CreateResidentUseCase } from './application/use-cases/create-resident.usecase';
import { CreateUserUseCase } from '../users/application/use-cases/create-user.usecase';
import { ResidentsCondominiumController } from './presentation/controllers/residents-condominium.controller';
import { HousesModule } from '../houses/houses.module';
import { GetListResidentsUseCase } from './application/use-cases/get-list-residents.usecase';

@Module({
  imports: [UsersModule, HousesModule],
  providers: [
    {
      provide: PROVIDES_NAMES.ResidentsRepository,
      useClass: ResidentsPrismaRepository,
    },
    {
      provide: CreateResidentUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.HousesRepository,
        CreateUserUseCase,
      ],
      useFactory: (repository, housesRepository, createUser) => {
        return new CreateResidentUseCase(
          repository,
          housesRepository,
          createUser,
        );
      },
    },
    {
      provide: GetListResidentsUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.HousesRepository,
      ],
      useFactory: (repository, housesRepository) => {
        return new GetListResidentsUseCase(repository, housesRepository);
      },
    },
  ],
  controllers: [ResidentsCondominiumController],
  exports: [PROVIDES_NAMES.ResidentsRepository, CreateResidentUseCase],
})
export class ResidentsModule {}
