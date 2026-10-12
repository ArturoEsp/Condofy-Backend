import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from '@/app/users/application/use-cases/create-user.usecase';
import { SuperadminCreateAdminCommand } from '../commands/create-admin.command';
import {
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

@Injectable()
export class SuperadminCreateAdminUseCase {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async execute(command: SuperadminCreateAdminCommand) {
    return await this.createUserUseCase.execute({
      email: command.email,
      password: command.password,
      firstName: command.firstName,
      lastName: command.lastName,
      phone: command.phone,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      condominiumId: command.condominiumId,
    });
  }
}

