import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/core.module';
import { ResidentsModule } from '../residents/residents.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebPushService } from '../notifications/infrastructure/services/web-push.service';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';

import { AccessAuthorizationsPrismaRepository } from './infrastructure/repositories/access-authorizations.prisma.repository';
import { VisitorsPrismaRepository } from './infrastructure/repositories/visitors.prisma.repository';
import { AccessLogsPrismaRepository } from './infrastructure/repositories/access-logs.prisma.repository';
import { ParcelDeliveryPrismaRepository } from './infrastructure/repositories/parcel-delivery.prisma.repository';

import { CreateAccessAuthorizationUseCase } from './application/use-cases/create-access-authorization.usecase';
import { ListHouseAccessAuthorizationsUseCase } from './application/use-cases/list-house-access-authorizations.usecase';
import { UpdateAccessAuthorizationUseCase } from './application/use-cases/update-access-authorization.usecase';
import { CreateVisitorUseCase } from './application/use-cases/create-visitor.usecase';
import { ListHouseVisitorsUseCase } from './application/use-cases/list-house-visitors.usecase';
import { GetPublicPassUseCase } from './application/use-cases/get-public-pass.usecase';
import { StandRegisterAccessLogUseCase } from './application/use-cases/stand-register-access-log.usecase';
import { StandGetAccessLogsUseCase } from './application/use-cases/stand-get-access-logs.usecase';
import { StandGetDashboardStatsUseCase } from './application/use-cases/stand-get-dashboard-stats.usecase';
import { ListGuardsUseCase } from './application/use-cases/list-guards.usecase';
import { UpdateGuardStatusUseCase } from './application/use-cases/update-guard-status.usecase';
import { DeleteGuardUseCase } from './application/use-cases/delete-guard.usecase';
import { StandRegisterParcelUseCase } from './application/use-cases/stand-register-parcel.usecase';
import { StandDeliverParcelUseCase } from './application/use-cases/stand-deliver-parcel.usecase';
import { StandGetParcelsUseCase } from './application/use-cases/stand-get-parcels.usecase';
import { StandGetParcelStatsUseCase } from './application/use-cases/stand-get-parcel-stats.usecase';
import { StandNotifyParcelUseCase } from './application/use-cases/stand-notify-parcel.usecase';
import { ResidentGetParcelsUseCase } from './application/use-cases/resident-get-parcels.usecase';
import { ResidentCreateDeliveryPassUseCase } from './application/use-cases/resident-create-delivery-pass.usecase';
import { DeleteAccessAuthorizationUseCase } from './application/use-cases/delete-access-authorization.usecase';
import { StandGetActiveEntriesUseCase } from './application/use-cases/stand-get-active-entries.usecase';
import { StandBatchExitUseCase } from './application/use-cases/stand-batch-exit.usecase';

import { ResidentAccessControlController } from './presentation/controllers/resident-access-control.controller';
import { ResidentVisitorsController } from './presentation/controllers/resident-visitors.controller';
import { ResidentParcelsController } from './presentation/controllers/resident-parcels.controller';
import { PublicPassController } from './presentation/controllers/public-pass.controller';
import { StandAccessControlController } from './presentation/controllers/stand-access-control.controller';
import { AdminSecurityController } from './presentation/controllers/admin-security.controller';

@Module({
  imports: [CoreModule, ResidentsModule, UsersModule, NotificationsModule],
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
      provide: PROVIDES_NAMES.ParcelDeliveryRepository,
      useClass: ParcelDeliveryPrismaRepository,
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
        PROVIDES_NAMES.ResidentsRepository,
        WebPushService,
      ],
      useFactory: (
        accessAuthorizationsRepo,
        accessLogsRepo,
        residentsRepo,
        webPushService,
      ) => {
        return new StandRegisterAccessLogUseCase(
          accessAuthorizationsRepo,
          accessLogsRepo,
          residentsRepo,
          webPushService,
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
    {
      provide: ListGuardsUseCase,
      inject: [PROVIDES_NAMES.UsersRepository],
      useFactory: (usersRepo) => {
        return new ListGuardsUseCase(usersRepo);
      },
    },
    {
      provide: UpdateGuardStatusUseCase,
      inject: [PROVIDES_NAMES.UsersRepository],
      useFactory: (usersRepo) => {
        return new UpdateGuardStatusUseCase(usersRepo);
      },
    },
    {
      provide: DeleteGuardUseCase,
      inject: [PROVIDES_NAMES.UsersRepository],
      useFactory: (usersRepo) => {
        return new DeleteGuardUseCase(usersRepo);
      },
    },
    {
      provide: StandRegisterParcelUseCase,
      inject: [
        PROVIDES_NAMES.ParcelDeliveryRepository,
        PROVIDES_NAMES.ResidentsRepository,
        WebPushService,
      ],
      useFactory: (parcelRepo, residentsRepo, webPushService) => {
        return new StandRegisterParcelUseCase(
          parcelRepo,
          residentsRepo,
          webPushService,
        );
      },
    },
    {
      provide: StandDeliverParcelUseCase,
      inject: [PROVIDES_NAMES.ParcelDeliveryRepository],
      useFactory: (parcelRepo) => {
        return new StandDeliverParcelUseCase(parcelRepo);
      },
    },
    {
      provide: StandGetParcelsUseCase,
      inject: [PROVIDES_NAMES.ParcelDeliveryRepository],
      useFactory: (parcelRepo) => {
        return new StandGetParcelsUseCase(parcelRepo);
      },
    },
    {
      provide: StandGetParcelStatsUseCase,
      inject: [PROVIDES_NAMES.ParcelDeliveryRepository],
      useFactory: (parcelRepo) => {
        return new StandGetParcelStatsUseCase(parcelRepo);
      },
    },
    {
      provide: StandNotifyParcelUseCase,
      inject: [
        PROVIDES_NAMES.ParcelDeliveryRepository,
        PROVIDES_NAMES.ResidentsRepository,
        WebPushService,
      ],
      useFactory: (parcelRepo, residentsRepo, webPushService) => {
        return new StandNotifyParcelUseCase(
          parcelRepo,
          residentsRepo,
          webPushService,
        );
      },
    },
    {
      provide: ResidentGetParcelsUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.ParcelDeliveryRepository,
      ],
      useFactory: (residentsRepo, parcelRepo) => {
        return new ResidentGetParcelsUseCase(residentsRepo, parcelRepo);
      },
    },
    {
      provide: ResidentCreateDeliveryPassUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.VisitorsRepository,
        PROVIDES_NAMES.AccessAuthorizationsRepository,
      ],
      useFactory: (residentsRepo, visitorsRepo, accessAuthorizationsRepo) => {
        return new ResidentCreateDeliveryPassUseCase(
          residentsRepo,
          visitorsRepo,
          accessAuthorizationsRepo,
        );
      },
    },
    {
      provide: DeleteAccessAuthorizationUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.AccessAuthorizationsRepository,
      ],
      useFactory: (residentsRepo, accessAuthorizationsRepo) => {
        return new DeleteAccessAuthorizationUseCase(
          residentsRepo,
          accessAuthorizationsRepo,
        );
      },
    },
    {
      provide: StandGetActiveEntriesUseCase,
      inject: [PROVIDES_NAMES.AccessLogsRepository],
      useFactory: (accessLogsRepo) => {
        return new StandGetActiveEntriesUseCase(accessLogsRepo);
      },
    },
    {
      provide: StandBatchExitUseCase,
      inject: [
        PROVIDES_NAMES.AccessAuthorizationsRepository,
        PROVIDES_NAMES.AccessLogsRepository,
      ],
      useFactory: (accessAuthorizationsRepo, accessLogsRepo) => {
        return new StandBatchExitUseCase(
          accessAuthorizationsRepo,
          accessLogsRepo,
        );
      },
    },
  ],
  controllers: [
    ResidentAccessControlController,
    ResidentVisitorsController,
    ResidentParcelsController,
    PublicPassController,
    StandAccessControlController,
    AdminSecurityController,
  ],
  exports: [
    PROVIDES_NAMES.AccessAuthorizationsRepository,
    PROVIDES_NAMES.VisitorsRepository,
    PROVIDES_NAMES.AccessLogsRepository,
    PROVIDES_NAMES.ParcelDeliveryRepository,
    CreateAccessAuthorizationUseCase,
    ListHouseAccessAuthorizationsUseCase,
    UpdateAccessAuthorizationUseCase,
    CreateVisitorUseCase,
    ListHouseVisitorsUseCase,
    GetPublicPassUseCase,
    StandRegisterAccessLogUseCase,
    StandGetAccessLogsUseCase,
    StandGetDashboardStatsUseCase,
    ListGuardsUseCase,
    UpdateGuardStatusUseCase,
    DeleteGuardUseCase,
    StandRegisterParcelUseCase,
    StandDeliverParcelUseCase,
    StandGetParcelsUseCase,
    StandGetParcelStatsUseCase,
    StandNotifyParcelUseCase,
    ResidentGetParcelsUseCase,
    ResidentCreateDeliveryPassUseCase,
    DeleteAccessAuthorizationUseCase,
    StandGetActiveEntriesUseCase,
    StandBatchExitUseCase,
  ],
})
export class AccessControlModule {}
