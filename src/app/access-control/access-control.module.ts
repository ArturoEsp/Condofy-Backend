import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/core.module';
import { ResidentsModule } from '../residents/residents.module';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';

import { AccessAuthorizationsPrismaRepository } from './infrastructure/repositories/access-authorizations.prisma.repository';
import { VisitorsPrismaRepository } from './infrastructure/repositories/visitors.prisma.repository';

import { CreateAccessAuthorizationUseCase } from './application/use-cases/create-access-authorization.usecase';
import { ListHouseAccessAuthorizationsUseCase } from './application/use-cases/list-house-access-authorizations.usecase';
import { UpdateAccessAuthorizationUseCase } from './application/use-cases/update-access-authorization.usecase';
import { CreateVisitorUseCase } from './application/use-cases/create-visitor.usecase';
import { ListHouseVisitorsUseCase } from './application/use-cases/list-house-visitors.usecase';

import { ResidentAccessControlController } from './presentation/controllers/resident-access-control.controller';
import { ResidentVisitorsController } from './presentation/controllers/resident-visitors.controller';

@Module({
  imports: [CoreModule, ResidentsModule],
  providers: [
    {
      provide: PROVIDES_NAMES.AccessAuthorizationsRepository,
      useClass: AccessAuthorizationsPrismaRepository,
    },
    {
      provide: PROVIDES_NAMES.VisitorsRepository,
      useClass: VisitorsPrismaRepository,
    },
    {
      provide: CreateAccessAuthorizationUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.VisitorsRepository,
        PROVIDES_NAMES.AccessAuthorizationsRepository,
      ],
      useFactory: (residentsRepo, visitorsRepo, accessAuthorizationsRepo) => {
        return new CreateAccessAuthorizationUseCase(
          residentsRepo,
          visitorsRepo,
          accessAuthorizationsRepo,
        );
      },
    },
    {
      provide: ListHouseAccessAuthorizationsUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.AccessAuthorizationsRepository,
      ],
      useFactory: (residentsRepo, accessAuthorizationsRepo) => {
        return new ListHouseAccessAuthorizationsUseCase(
          residentsRepo,
          accessAuthorizationsRepo,
        );
      },
    },
    {
      provide: UpdateAccessAuthorizationUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.AccessAuthorizationsRepository,
      ],
      useFactory: (residentsRepo, accessAuthorizationsRepo) => {
        return new UpdateAccessAuthorizationUseCase(
          residentsRepo,
          accessAuthorizationsRepo,
        );
      },
    },
    {
      provide: CreateVisitorUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.VisitorsRepository,
      ],
      useFactory: (residentsRepo, visitorsRepo) => {
        return new CreateVisitorUseCase(residentsRepo, visitorsRepo);
      },
    },
    {
      provide: ListHouseVisitorsUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.VisitorsRepository,
      ],
      useFactory: (residentsRepo, visitorsRepo) => {
        return new ListHouseVisitorsUseCase(residentsRepo, visitorsRepo);
      },
    },
  ],
  controllers: [ResidentAccessControlController, ResidentVisitorsController],
  exports: [
    PROVIDES_NAMES.AccessAuthorizationsRepository,
    PROVIDES_NAMES.VisitorsRepository,
    CreateAccessAuthorizationUseCase,
    ListHouseAccessAuthorizationsUseCase,
    UpdateAccessAuthorizationUseCase,
    CreateVisitorUseCase,
    ListHouseVisitorsUseCase,
  ],
})
export class AccessControlModule {}
