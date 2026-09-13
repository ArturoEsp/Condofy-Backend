import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import UsersRepository, {
  CreateUser,
  FindManyUsersFilters,
} from '../../domain/repositories/users.repository';

@Injectable()
export class UsersPrismaRepository implements UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateUser) {
    return await this.prismaService.user.create({
      data,
    });
  }

  async update(id: string, data: Partial<CreateUser>) {
    return await this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.user.delete({
      where: { id },
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
