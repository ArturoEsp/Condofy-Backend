import { Module, forwardRef } from '@nestjs/common';

import { ResidentsPrismaRepository } from './infrastructure/repositories/residents.prisma.repository';
import { UserSessionPrismaRepository } from '../auth/infrastructure/repositories/user-session.prisma.repository';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { UsersModule } from '../users/users.module';
import { HousesModule } from '../houses/houses.module';
import { CoreModule } from '@/core/core.module';
import { AuthModule } from '../auth/auth.module';

import { CreateResidentUseCase } from './application/use-cases/create-resident.usecase';
import { CreateUserUseCase } from '../users/application/use-cases/create-user.usecase';
import { GetListResidentsUseCase } from './application/use-cases/get-list-residents.usecase';
import { GetMyHouseUseCase } from './application/use-cases/get-my-house.usecase';
import { CreateFamilyMemberUseCase } from './application/use-cases/create-family-member.usecase';
import { ListFamilyMembersUseCase } from './application/use-cases/list-family-members.usecase';
import { UpdateFamilyMemberUseCase } from './application/use-cases/update-family-member.usecase';
import { ToggleFamilyMemberStatusUseCase } from './application/use-cases/toggle-family-member-status.usecase';
import { AdminSendResidentResetPasswordUseCase } from './application/use-cases/admin-send-resident-reset-password.usecase';
import { AdminUpdateResidentPasswordUseCase } from './application/use-cases/admin-update-resident-password.usecase';
import { RequestPasswordResetUseCase } from '../auth/application/use-cases/request-password-reset.usecase';

import { ResidentsCondominiumController } from './presentation/controllers/residents-condominium.controller';
import { ResidentFamilyController } from './presentation/controllers/resident-family.controller';

@Module({
  imports: [
    UsersModule,
    HousesModule,
    CoreModule,
    forwardRef(() => AuthModule),
  ],
  providers: [
    {
      provide: PROVIDES_NAMES.ResidentsRepository,
      useClass: ResidentsPrismaRepository,
    },
    {
      provide: PROVIDES_NAMES.UserSessionsRepository,
      useClass: UserSessionPrismaRepository,
    },
    {
      provide: CreateResidentUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.HousesRepository,
        CreateUserUseCase,
        PROVIDES_NAMES.UsersRepository,
      ],
      useFactory: (
        repository,
        housesRepository,
        createUser,
        usersRepository,
      ) => {
        return new CreateResidentUseCase(
          repository,
          housesRepository,
          createUser,
          usersRepository,
        );
      },
    },
    {
      provide: GetListResidentsUseCase,
      inject: [PROVIDES_NAMES.ResidentsRepository],
      useFactory: (repository) => {
        return new GetListResidentsUseCase(repository);
      },
    },
    {
      provide: GetMyHouseUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.HousesRepository,
      ],
      useFactory: (residentsRepository, housesRepository) => {
        return new GetMyHouseUseCase(residentsRepository, housesRepository);
      },
    },
    {
      provide: CreateFamilyMemberUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        CreateUserUseCase,
        PROVIDES_NAMES.UsersRepository,
      ],
      useFactory: (repository, createUser, usersRepository) => {
        return new CreateFamilyMemberUseCase(
          repository,
          createUser,
          usersRepository,
        );
      },
    },
    {
      provide: ListFamilyMembersUseCase,
      inject: [PROVIDES_NAMES.ResidentsRepository],
      useFactory: (repository) => {
        return new ListFamilyMembersUseCase(repository);
      },
    },
    {
      provide: UpdateFamilyMemberUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.UsersRepository,
        PROVIDES_NAMES.EncryptionService,
      ],
      useFactory: (repository, usersRepository, encryptionService) => {
        return new UpdateFamilyMemberUseCase(
          repository,
          usersRepository,
          encryptionService,
        );
      },
    },
    {
      provide: ToggleFamilyMemberStatusUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.UsersRepository,
        PROVIDES_NAMES.UserSessionsRepository,
      ],
      useFactory: (repository, usersRepository, sessionRepository) => {
        return new ToggleFamilyMemberStatusUseCase(
          repository,
          usersRepository,
          sessionRepository,
        );
      },
    },
    {
      provide: AdminSendResidentResetPasswordUseCase,
      inject: [PROVIDES_NAMES.ResidentsRepository, RequestPasswordResetUseCase],
      useFactory: (residentsRepository, requestPasswordResetUseCase) => {
        return new AdminSendResidentResetPasswordUseCase(
          residentsRepository,
          requestPasswordResetUseCase,
        );
      },
    },
    {
      provide: AdminUpdateResidentPasswordUseCase,
      inject: [
        PROVIDES_NAMES.ResidentsRepository,
        PROVIDES_NAMES.UsersRepository,
        PROVIDES_NAMES.EncryptionService,
        PROVIDES_NAMES.UserSessionsRepository,
      ],
      useFactory: (
        residentsRepository,
        usersRepository,
        encryptionService,
        userSessionRepository,
      ) => {
        return new AdminUpdateResidentPasswordUseCase(
          residentsRepository,
          usersRepository,
          encryptionService,
          userSessionRepository,
        );
      },
    },
  ],
  controllers: [ResidentsCondominiumController, ResidentFamilyController],
  exports: [
    PROVIDES_NAMES.ResidentsRepository,
    CreateResidentUseCase,
    CreateFamilyMemberUseCase,
    ListFamilyMembersUseCase,
    UpdateFamilyMemberUseCase,
    ToggleFamilyMemberStatusUseCase,
    GetMyHouseUseCase,
    AdminSendResidentResetPasswordUseCase,
    AdminUpdateResidentPasswordUseCase,
  ],
})
export class ResidentsModule {}
