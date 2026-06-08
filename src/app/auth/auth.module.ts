import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

import { JwtStrategy } from './presentation/strategies/jwt.strategy';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { PROVIDES_NAMES } from '../common/enums/provides-names.enums';
import { UserSessionPrismaRepository } from './infrastructure/repositories/user-session.prisma.repository';
import { LoginUseCase } from './application/use-cases/login.usecase';
import { UsersModule } from '../users/users.module';
import { AuthController } from './presentation/controllers/auth.controller';
import { MeUseCase } from './application/use-cases/me.usecase';
import { RefreshUseCase } from './application/use-cases/refresh-token.usecase';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('APP_SECRET'),
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: PROVIDES_NAMES.UserSessionsRepository,
      useClass: UserSessionPrismaRepository,
    },
    LoginUseCase,
    MeUseCase,
    RefreshUseCase,
  ],
  exports: [JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}
