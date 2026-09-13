import { Module } from '@nestjs/common';
import { HousesPrismaRepository } from './infrastructure/repositories/houses.prisma.repository';
import { UsersModule } from '../users/users.module';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { CreateHouseUseCase } from './application/use-cases/create-house.usecase';
import { HousesCondominiumController } from './presentation/controllers/houses-condominium.controller';
import { ListHousesUseCase } from './application/use-cases/list-houses.usecase';
import { UpdateHouseUseCase } from './application/use-cases/update-house.usecase';

@Module({
  imports: [UsersModule],
  providers: [
    {
      useClass: HousesPrismaRepository,
      provide: PROVIDES_NAMES.HousesRepository,
    },
    {
      provide: CreateHouseUseCase,
      inject: [PROVIDES_NAMES.HousesRepository],
      useFactory: (repository) => {
        return new CreateHouseUseCase(repository);
      },
    },
    {
      provide: ListHousesUseCase,
      inject: [PROVIDES_NAMES.HousesRepository],
      useFactory: (repository) => {
        return new ListHousesUseCase(repository);
      },
    },
    {
      provide: UpdateHouseUseCase,
      inject: [PROVIDES_NAMES.HousesRepository],
      useFactory: (repository) => {
        return new UpdateHouseUseCase(repository);
      },
    },
  ],
  controllers: [HousesCondominiumController],
  exports: [PROVIDES_NAMES.HousesRepository],
})
export class HousesModule {}
