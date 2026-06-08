import { Module } from '@nestjs/common';

import { UsersController } from './presentation/controllers/users.controller';
import { CreateUserUseCase } from './application/use-case/create-user.usecase';
import { PrismaModule } from '@/core/infrastructure/persistence/prisma/prisma.module';
import { PROVIDES_NAMES } from '../common/enums/provides-names.enums';
import { UsersPrismaRepository } from './infrastructure/repositories/users.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    {
      provide: PROVIDES_NAMES.UsersRepository,
      useClass: UsersPrismaRepository,
    },
    CreateUserUseCase,
  ],
  exports: [
    {
      provide: PROVIDES_NAMES.UsersRepository,
      useClass: UsersPrismaRepository,
    },
  ],
})
export class UsersModule {}
