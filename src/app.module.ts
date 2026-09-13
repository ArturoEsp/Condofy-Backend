import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { CoreModule } from './core/core.module';
import { UsersModule } from './app/users/users.module';
import { AuthModule } from './app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CondominiumsModule } from './app/condominiums/condominiums.module';
import { JwtAuthGuard } from './app/auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from './app/auth/presentation/guards/roles.guard';
import { ResidentsModule } from './app/residents/residents.module';
import { CondominiumIdPipe } from './common/pipes/condominium-id.pipe';
import { HousesModule } from './app/houses/houses.module';
import { AccessControlModule } from './app/access-control/access-control.module';

import { CondominiumGuard } from './app/auth/presentation/guards/condominium.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
    }),
    CoreModule,
    ResidentsModule,
    UsersModule,
    AuthModule,
    CondominiumsModule,
    HousesModule,
    AccessControlModule,
  ],
  controllers: [],
  providers: [
    CondominiumIdPipe,
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
