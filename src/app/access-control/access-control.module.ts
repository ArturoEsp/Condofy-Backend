import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/core.module';
import { ResidentsModule } from '../residents/residents.module';
import { UsersModule } from '../users/users.module';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';

import { AccessAuthorizationsPrismaRepository } from './infrastructure/repositories/access-authorizations.prisma.repository';
import { VisitorsPrismaRepository } from './infrastructure/repositories/visitors.prisma.repository';
import { AccessLogsPrismaRepository } from './infrastructure/repositories/access-logs.prisma.repository';

import { CreateAccessAuthorizationUseCase } from './application/use-cases/create-access-authorization.usecase';
import { ListHouseAccessAuthorizationsUseCase } from './application/use-cases/list-house-access-authorizations.usecase';
import { UpdateAccessAuthorizationUseCase } from './application/use-cases/update-access-authorization.usecase';
import { CreateVisitorUseCase } from './application/use-cases/create-visitor.usecase';
import { ListHouseVisitorsUseCase } from './application/use-cases/list-house-visitors.usecase';
import { GetPublicPassUseCase } from './application/use-cases/get-public-pass.usecase';
import { StandRegisterAccessLogUseCase } from './application/use-cases/stand-register-access-log.usecase';
import { StandGetAccessLogsUseCase } from './application/use-cases/stand-get-access-logs.usecase';
import { StandGetDashboardStatsUseCase } from './application/use-cases/stand-get-dashboard-stats.usecase';

import { ResidentAccessControlController } from './presentation/controllers/resident-access-control.controller';
import { ResidentVisitorsController } from './presentation/controllers/resident-visitors.controller';
import { PublicPassController } from './presentation/controllers/public-pass.controller';
import { StandAccessControlController } from './presentation/controllers/stand-access-control.controller';
import { AdminSecurityController } from './presentation/controllers/admin-security.controller';

@Module({
  imports: [CoreModule, ResidentsModule, UsersModule],
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
      provide: PROVIDES_NAMES.AccessLogsRepository,
      useClass: AccessLogsPrismaRepository,
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
    {
      provide: GetPublicPassUseCase,
      inject: [PROVIDES_NAMES.AccessAuthorizationsRepository],
      useFactory: (accessAuthorizationsRepo) => {
        return new GetPublicPassUseCase(accessAuthorizationsRepo);
      },
    },
    {
      provide: StandRegisterAccessLogUseCase,
      inject: [
        PROVIDES_NAMES.AccessAuthorizationsRepository,
        PROVIDES_NAMES.AccessLogsRepository,
      ],
      useFactory: (accessAuthorizationsRepo, accessLogsRepo) => {
        return new StandRegisterAccessLogUseCase(
          accessAuthorizationsRepo,
          accessLogsRepo,
        );
      },
    },
    {
      provide: StandGetAccessLogsUseCase,
      inject: [PROVIDES_NAMES.AccessLogsRepository],
      useFactory: (accessLogsRepo) => {
        return new StandGetAccessLogsUseCase(accessLogsRepo);
      },
    },
    {
      provide: StandGetDashboardStatsUseCase,
      inject: [PROVIDES_NAMES.AccessLogsRepository],
      useFactory: (accessLogsRepo) => {
        return new StandGetDashboardStatsUseCase(accessLogsRepo);
      },
    },
  ],
  controllers: [
    ResidentAccessControlController,
    ResidentVisitorsController,
    PublicPassController,
    StandAccessControlController,
    AdminSecurityController,
  ],
  exports: [
    PROVIDES_NAMES.AccessAuthorizationsRepository,
    PROVIDES_NAMES.VisitorsRepository,
    PROVIDES_NAMES.AccessLogsRepository,
    CreateAccessAuthorizationUseCase,
    ListHouseAccessAuthorizationsUseCase,
    UpdateAccessAuthorizationUseCase,
    CreateVisitorUseCase,
    ListHouseVisitorsUseCase,
    GetPublicPassUseCase,
    StandRegisterAccessLogUseCase,
    StandGetAccessLogsUseCase,
    StandGetDashboardStatsUseCase,
  ],
})
export class AccessControlModule {}
