import { Module } from '@nestjs/common';
import { CondominiumsModule } from '@/app/condominiums/condominiums.module';
import { UsersModule } from '@/app/users/users.module';
import { CoreModule } from '@/core/core.module';

import { SuperadminController } from './presentation/controllers/superadmin.controller';
import { SuperadminListCondominiumsUseCase } from './application/use-cases/list-condominiums.usecase';
import { SuperadminCreateCondominiumUseCase } from './application/use-cases/create-condominium.usecase';
import { SuperadminListAdminsUseCase } from './application/use-cases/list-admins.usecase';
import { SuperadminCreateAdminUseCase } from './application/use-cases/create-admin.usecase';
import { SuperadminDeleteAdminUseCase } from './application/use-cases/delete-admin.usecase';
import { SuperadminListPlansUseCase } from './application/use-cases/list-plans.usecase';
import { SuperadminUpdateCondominiumUseCase } from './application/use-cases/update-condominium.usecase';

@Module({
  imports: [
    CoreModule,
    CondominiumsModule, // Provee CondominiumsRepository y sus use-cases
    UsersModule,        // Provee CreateUserUseCase
  ],
  controllers: [SuperadminController],
  providers: [
    SuperadminListCondominiumsUseCase,
    SuperadminCreateCondominiumUseCase,
    SuperadminUpdateCondominiumUseCase,
    SuperadminListAdminsUseCase,
    SuperadminCreateAdminUseCase,
    SuperadminDeleteAdminUseCase,
    SuperadminListPlansUseCase,
  ],
})
export class SuperadminModule {}

