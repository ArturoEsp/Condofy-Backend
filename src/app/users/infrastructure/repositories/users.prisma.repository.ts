import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import UsersRepository, {
  CreateUser,
  FindManyUsersFilters,
} from '../../domain/repositories/users.repository';

const SALT_OR_ROUNDS = 10;

@Injectable()
export class UsersPrismaRepository implements UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateUser) {
    const { passwordHash, ...userData } = data;

    const hash = await bcrypt.hash(passwordHash, SALT_OR_ROUNDS);

    return await this.prismaService.user.create({
      data: {
        ...userData,
        passwordHash: hash,
      },
    });
  }

  async update(id: string, data: Partial<CreateUser>) {
    let passwordHash: string | undefined;

    if (data.passwordHash) {
      passwordHash = await bcrypt.hash(data.passwordHash, SALT_OR_ROUNDS);
    }

    return await this.prismaService.user.update({
      where: { id },
      data: {
        ...data,
        ...(passwordHash && { passwordHash }),
      },
    });
  }

  async findOneByEmail(email: string) {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findOneById(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findMany(filters?: FindManyUsersFilters) {
    return await this.prismaService.user.findMany(filters);
  }
}
