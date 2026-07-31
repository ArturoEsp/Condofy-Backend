import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { HouseEntity } from '../../domain/entities/house.entity';
import HousesRepository, {
  CreateHouse,
  ParamsFindMany,
  UpdateHouse,
} from '../../domain/repositories/houses.repository';
import { HouseEntityMapper } from '../mappers/house.mapper';

@Injectable()
export class HousesPrismaRepository implements HousesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateHouse): Promise<HouseEntity> {
    const house = await this.prismaService.house.create({
      data,
      include: { residents: { include: { user: true } } },
    });

    return HouseEntityMapper.toDomain(house);
  }

  async update(id: string, data: UpdateHouse): Promise<HouseEntity> {
    const house = await this.prismaService.house.update({
      where: { id },
      include: { residents: { include: { user: true } } },
      data,
    });

    return HouseEntityMapper.toDomain(house);
  }

  async findOneById(id: string): Promise<HouseEntity | null> {
    const house = await this.prismaService.house.findUnique({
      where: { id },
      include: { residents: { include: { user: true } } },
    });

    return house ? HouseEntityMapper.toDomain(house) : null;
  }

  async findOneByNumber(
    number: string,
    condominiumId: string,
  ): Promise<HouseEntity | null> {
    const house = await this.prismaService.house.findFirst({
      where: { houseNumber: number, condominiumId },
      include: { residents: { include: { user: true } } },
    });

    return house ? HouseEntityMapper.toDomain(house) : null;
  }

  async findMany(params?: Partial<ParamsFindMany>): Promise<HouseEntity[]> {
    const { page, size, fullText, condominiumId, orderBy } = params;

    const houses = await this.prismaService.house.findMany({
      include: { residents: { include: { user: true } } },
      where: {
        ...(condominiumId && { condominiumId }),
        ...(fullText && {
          houseNumber: {
            contains: fullText,
            mode: 'insensitive',
          },
        }),
      },
      ...(orderBy && { orderBy: { createdAt: orderBy } }),
      ...(size && { take: size }),
      ...(page && { skip: (page - 1) * size }),
    });

    return houses.map(HouseEntityMapper.toDomain);
  }

  async count(params?: Partial<ParamsFindMany>) {
    const { fullText, condominiumId } = params;

    return await this.prismaService.house.count({
      where: {
        ...(condominiumId && { condominiumId }),
        ...(fullText && {
          houseNumber: {
            contains: fullText,
            mode: 'insensitive',
          },
        }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.house.delete({
      where: { id },
    });
  }
}
