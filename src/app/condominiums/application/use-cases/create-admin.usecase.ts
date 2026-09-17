import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from '@/app/users/application/use-cases/create-user.usecase';
import { CreateAdminRequest } from '../../presentation/dtos/requests/create-admin.request';
import {
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

@Injectable()
export class CreateAdminUseCase {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async execute(condominiumId: string, dto: CreateAdminRequest) {
    return await this.createUserUseCase.execute({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      condominiumId,
    });
  }
}
