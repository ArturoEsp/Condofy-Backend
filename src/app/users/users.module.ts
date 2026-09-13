import { Module } from '@nestjs/common';

import { UsersController } from './presentation/controllers/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { PrismaModule } from '@/core/infrastructure/persistence/prisma/prisma.module';
import { UsersPrismaRepository } from './infrastructure/repositories/users.prisma.repository';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { CoreModule } from '@/core/core.module';

@Module({
  imports: [PrismaModule, CoreModule],
  controllers: [UsersController],
  providers: [
    {
      provide: PROVIDES_NAMES.UsersRepository,
      useClass: UsersPrismaRepository,
    },
    {
      provide: CreateUserUseCase,
      inject: [
        PROVIDES_NAMES.UsersRepository,
        PROVIDES_NAMES.EncryptionService,
      ],
      useFactory: (repository, encryptionService) => {
        return new CreateUserUseCase(repository, encryptionService);
      },
    },
  ],
  exports: [PROVIDES_NAMES.UsersRepository, CreateUserUseCase],
})
export class UsersModule {}
