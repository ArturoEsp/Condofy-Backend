import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { ScheduleModule } from '@nestjs/schedule';

import { CoreModule } from './core/core.module';
import { UsersModule } from './app/users/users.module';
import { AuthModule } from './app/auth/auth.module';
import { CondominiumsModule } from './app/condominiums/condominiums.module';
import { JwtAuthGuard } from './app/auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from './app/auth/presentation/guards/roles.guard';
import { ResidentsModule } from './app/residents/residents.module';
import { CondominiumIdPipe } from './common/pipes/condominium-id.pipe';
import { HousesModule } from './app/houses/houses.module';
import { AccessControlModule } from './app/access-control/access-control.module';
import { NotificationsModule } from './app/notifications/notifications.module';
import { UploadsModule } from './app/uploads/uploads.module';
import { CondominiumGuard } from './app/auth/presentation/guards/condominium.guard';
import { HealthModule } from './app/health/health.module';
import { BillingModule } from './app/billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 segundos
        limit: 100, // máximo 100 peticiones por minuto por IP por defecto
      },
    ]),
    ScheduleModule.forRoot(),
    HealthModule,
    CoreModule,
    ResidentsModule,
    UsersModule,
    AuthModule,
    CondominiumsModule,
    HousesModule,
    AccessControlModule,
    NotificationsModule,
    UploadsModule,
    BillingModule,
  ],
  controllers: [],
  providers: [
    CondominiumIdPipe,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CondominiumGuard,
    },
  ],
})
export class AppModule {}
