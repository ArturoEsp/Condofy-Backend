import { Module, forwardRef } from '@nestjs/common';
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
import { UpdateProfileUseCase } from './application/use-cases/update-profile.usecase';
import { ChangePasswordUseCase } from './application/use-cases/change-password.usecase';
import { RequestPasswordResetUseCase } from './application/use-cases/request-password-reset.usecase';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.usecase';
import { PasswordResetTokensPrismaRepository } from './infrastructure/repositories/password-reset-tokens.prisma.repository';
import { SessionCleanupTask } from './infrastructure/tasks/session-cleanup.task';

@Module({
  imports: [
    CoreModule,
    UsersModule,
    forwardRef(() => ResidentsModule),
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
    SessionCleanupTask,
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
    {
      provide: UpdateProfileUseCase,
      inject: [
        PROVIDES_NAMES.UsersRepository,
        PROVIDES_NAMES.ResidentsRepository,
        MeUseCase,
      ],
      useFactory: (users, residents, me) => {
        return new UpdateProfileUseCase(users, residents, me);
      },
    },
    {
      provide: ChangePasswordUseCase,
      inject: [
        PROVIDES_NAMES.UsersRepository,
        PROVIDES_NAMES.EncryptionService,
      ],
      useFactory: (users, encryption) => {
        return new ChangePasswordUseCase(users, encryption);
      },
    },
    {
      provide: PROVIDES_NAMES.PasswordResetTokensRepository,
      useClass: PasswordResetTokensPrismaRepository,
    },
    {
      provide: RequestPasswordResetUseCase,
      inject: [
        PROVIDES_NAMES.UsersRepository,
        PROVIDES_NAMES.PasswordResetTokensRepository,
        PROVIDES_NAMES.MailService,
        ConfigService,
      ],
      useFactory: (users, tokens, mail, config) => {
        return new RequestPasswordResetUseCase(users, tokens, mail, config);
      },
    },
    {
      provide: ResetPasswordUseCase,
      inject: [
        PROVIDES_NAMES.UsersRepository,
        PROVIDES_NAMES.PasswordResetTokensRepository,
        PROVIDES_NAMES.EncryptionService,
        PROVIDES_NAMES.UserSessionsRepository,
      ],
      useFactory: (users, tokens, encryption, sessions) => {
        return new ResetPasswordUseCase(users, tokens, encryption, sessions);
      },
    },
  ],
  exports: [JwtModule, RequestPasswordResetUseCase],
  controllers: [AuthController],
})
export class AuthModule {}
