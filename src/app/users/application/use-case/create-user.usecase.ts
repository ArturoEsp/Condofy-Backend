import { Inject, Injectable } from '@nestjs/common';
import UsersRepository from '../../domain/repositories/users.repository';
import { PROVIDES_NAMES } from '@/app/common/enums/provides-names.enums';
import { CreateUserRequest } from '../dtos/requests/create-user.request';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(data: CreateUserRequest) {
    return await this.usersRepository.create({
      email: data.email,
      passwordHash: data.password,
      isEmailVerified: true,
      role: 'ADMIN',
      status: 'ACTIVE',
    });
  }
}
