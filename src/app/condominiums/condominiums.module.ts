import { Module } from '@nestjs/common';
import { CondominiumsPrismaRepository } from './infrastructure/repositories/condominiums.prisma.repository';
import { CondominiumsController } from './presentation/controllers/condominiums.controller';
import { AdminCondominiumController } from './presentation/controllers/admin-condominium.controller';
import { AdminUsersController } from './presentation/controllers/admin-users.controller';
import { CreateCondominiumUseCase } from './application/use-cases/create-condominium.usecase';
import { GetCondominiumByKeyUseCase } from './application/use-cases/get-condominium-by-key.usecase';
import { GetCondominiumDetailsUseCase } from './application/use-cases/get-condominium-details.usecase';
import { UpdateCondominiumUseCase } from './application/use-cases/update-condominium.usecase';
import { ListAdminsUseCase } from './application/use-cases/list-admins.usecase';
import { CreateAdminUseCase } from './application/use-cases/create-admin.usecase';
import { UpdateAdminStatusUseCase } from './application/use-cases/update-admin-status.usecase';
import { UpdateAdminUseCase } from './application/use-cases/update-admin.usecase';
import { DeleteAdminUseCase } from './application/use-cases/delete-admin.usecase';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { CoreModule } from '@/core/core.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [CoreModule, UsersModule],
  providers: [
    {
      provide: PROVIDES_NAMES.CondominiumsRepository,
      useClass: CondominiumsPrismaRepository,
    },
    {
      provide: CreateCondominiumUseCase,
      inject: [PROVIDES_NAMES.CondominiumsRepository],
      useFactory: (repository) => {
        return new CreateCondominiumUseCase(repository);
      },
    },
    {
      provide: GetCondominiumByKeyUseCase,
      inject: [PROVIDES_NAMES.CondominiumsRepository],
      useFactory: (repository) => {
        return new GetCondominiumByKeyUseCase(repository);
      },
    },
    {
      provide: GetCondominiumDetailsUseCase,
      inject: [PROVIDES_NAMES.CondominiumsRepository],
      useFactory: (repository) => {
        return new GetCondominiumDetailsUseCase(repository);
      },
    },
    {
      provide: UpdateCondominiumUseCase,
      inject: [PROVIDES_NAMES.CondominiumsRepository],
      useFactory: (repository) => {
        return new UpdateCondominiumUseCase(repository);
      },
    },
    ListAdminsUseCase,
    CreateAdminUseCase,
    UpdateAdminStatusUseCase,
    UpdateAdminUseCase,
    DeleteAdminUseCase,
  ],
  controllers: [
    CondominiumsController,
    AdminCondominiumController,
    AdminUsersController,
  ],
  exports: [
    PROVIDES_NAMES.CondominiumsRepository,
    CreateCondominiumUseCase,
    GetCondominiumDetailsUseCase,
    UpdateCondominiumUseCase,
  ],
})
export class CondominiumsModule {}
