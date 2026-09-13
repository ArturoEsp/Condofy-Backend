import { Module } from '@nestjs/common';
import { CondominiumsPrismaRepository } from './infrastructure/repositories/condominiums.prisma.repository';
import { CondominiumsController } from './presentation/controllers/condominiums.controller';
import { CreateCondominiumUseCase } from './application/use-cases/create-condominium.usecase';
import { GetCondominiumByKeyUseCase } from './application/use-cases/get-condominium-by-key.usecase';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';

@Module({
  imports: [],
  providers: [
    {
      provide: PROVIDES_NAMES.CondominiumsRepository,
      useClass: CondominiumsPrismaRepository,
    },
    {
      provide: CreateCondominiumUseCase,
      inject: [PROVIDES_NAMES.CondominiumsRepository],
      useFactory: (repository) => {
        return new CreateCondominiumUseCase(repository);
      },
    },
    {
      provide: GetCondominiumByKeyUseCase,
      inject: [PROVIDES_NAMES.CondominiumsRepository],
      useFactory: (repository) => {
        return new GetCondominiumByKeyUseCase(repository);
      },
    },
  ],
  controllers: [CondominiumsController],
  exports: [PROVIDES_NAMES.CondominiumsRepository, CreateCondominiumUseCase],
})
export class CondominiumsModule {}
