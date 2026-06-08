import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PROVIDES_NAMES } from '@/app/common/enums/provides-names.enums';
import UsersRepository from '@/app/users/domain/repositories/users.repository';

@Injectable()
export class MeUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.usersRepository.findOneById(userId);

    if (!user) throw new NotFoundException();

    return user;
  }
}
