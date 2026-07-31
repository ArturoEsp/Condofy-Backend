import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import CondominiumsRepository, {
  CreateCondominium,
} from '../../domain/repositories/condominiums.repository';

@Injectable()
export class CondominiumsPrismaRepository implements CondominiumsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateCondominium) {
    return await this.prismaService.condominium.create({
      data,
    });
  }

  async update(id: string, data: Partial<CreateCondominium>) {
    return await this.prismaService.condominium.update({
      where: { id },
      data,
    });
  }

  async findOneByAdminId(userId: string) {
    return await this.prismaService.condominium.findFirst({
      where: { admins: { some: { id: userId } } },
    });
  }

  async findOneById(id: string) {
    return await this.prismaService.condominium.findUnique({
      where: { id },
    });
  }

  async findOneByKey(key: string) {
    return await this.prismaService.condominium.findUnique({
      where: { key },
    });
  }
}
