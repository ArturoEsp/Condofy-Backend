import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './presentation/strategies/jwt.strategy';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { UserSessionPrismaRepository } from './infrastructure/repositories/user-session.prisma.repository';
import { LoginUseCase } from './application/use-cases/login.usecase';
import { UsersModule } from '../users/users.module';
import { AuthController } from './presentation/controllers/auth.controller';
import { MeUseCase } from './application/use-cases/me.usecase';
import { RefreshUseCase } from './application/use-cases/refresh-token.usecase';
import { CoreModule } from '@/core/core.module';
import { ResidentsModule } from '../residents/residents.module';
import { CondominiumsModule } from '../condominiums/condominiums.module';
import { LogoutUseCase } from './application/use-cases/logout.usecase';

@Module({
  imports: [
    CoreModule,
    UsersModule,
    ResidentsModule,
    CondominiumsModule,
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
      provide: PROVIDES_NAMES.UserSessionsRepository,
      useClass: UserSessionPrismaRepository,
    },
    {
      provide: LoginUseCase,
      inject: [
        PROVIDES_NAMES.UsersRepository,
        PROVIDES_NAMES.UserSessionsRepository,
        JwtService,
        PROVIDES_NAMES.EncryptionService,
        PROVIDES_NAMES.CondominiumsRepository,
      ],
      useFactory: (repository, session, jwt, encryption, condominiums) => {
        return new LoginUseCase(
          repository,
          session,
          jwt,
          encryption,
          condominiums,
        );
      },
    },
    {
      provide: MeUseCase,
      inject: [
        PROVIDES_NAMES.UsersRepository,
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.CondominiumsRepository,
      ],
      useFactory: (repository, residents, condominiums) => {
        return new MeUseCase(repository, residents, condominiums);
      },
    },
    {
      provide: LogoutUseCase,
      inject: [PROVIDES_NAMES.UserSessionsRepository, JwtService],
      useFactory: (session, jwt) => {
        return new LogoutUseCase(session, jwt);
      },
    },
    {
      provide: RefreshUseCase,
      inject: [
        PROVIDES_NAMES.UserSessionsRepository,
        JwtService,
        PROVIDES_NAMES.EncryptionService,
      ],
      useFactory: (sessions, jwt, encryption) => {
        return new RefreshUseCase(sessions, jwt, encryption);
      },
    },
  ],
  exports: [JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}
