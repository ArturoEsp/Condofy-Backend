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
    CreateCondominiumUseCase,
    GetCondominiumByKeyUseCase,
  ],
  controllers: [CondominiumsController],
  exports: [PROVIDES_NAMES.CondominiumsRepository],
})
export class CondominiumsModule {}
