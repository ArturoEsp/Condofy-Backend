import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import VisitorsRepository, {
  CreateVisitorData,
  ParamsCountVisitors,
  ParamsFindManyVisitors,
} from '../../domain/repositories/visitors.repository';
import { VisitorEntity } from '../../domain/entities/visitor.entity';
import { VisitorEntityMapper } from '../mappers/visitor.mapper';
import { Prisma } from '@/core/infrastructure/persistence/prisma/generated/client';

@Injectable()
export class VisitorsPrismaRepository implements VisitorsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateVisitorData): Promise<VisitorEntity> {
    const visitor = await this.prismaService.visitor.create({
      data: {
        houseId: data.houseId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        photo: data.photo,
        category: data.category,
        vehiclePlate: data.vehiclePlate,
        notes: data.notes,
      },
    });

    return VisitorEntityMapper.toDomain(visitor);
  }

  async findOneById(id: string): Promise<VisitorEntity | null> {
    const visitor = await this.prismaService.visitor.findUnique({
      where: { id },
    });

    return visitor ? VisitorEntityMapper.toDomain(visitor) : null;
  }

  async findManyByHouseId(houseId: string): Promise<VisitorEntity[]> {
    const visitors = await this.prismaService.visitor.findMany({
      where: { houseId },
      orderBy: { createdAt: 'desc' },
    });

    return visitors.map(VisitorEntityMapper.toDomain);
  }

  async findMany(params: ParamsFindManyVisitors): Promise<VisitorEntity[]> {
    const where = this.buildWhereInput(params);

    const visitors = await this.prismaService.visitor.findMany({
      where,
      skip: (params.page - 1) * params.size,
      take: params.size,
      orderBy: {
        createdAt: params.orderBy ?? 'desc',
      },
    });

    return visitors.map(VisitorEntityMapper.toDomain);
  }

  async count(params: ParamsCountVisitors): Promise<number> {
    const where = this.buildWhereInput(params);

    return await this.prismaService.visitor.count({
      where,
    });
  }

  private buildWhereInput(
    params: ParamsCountVisitors,
  ): Prisma.VisitorWhereInput {
    const where: Prisma.VisitorWhereInput = {
      houseId: params.houseId,
      ...(params.category ? { category: params.category } : {}),
      ...(params.search
        ? {
            OR: [
              {
                firstName: {
                  contains: params.search,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: params.search,
                  mode: 'insensitive',
                },
              },
              {
                phone: {
                  contains: params.search,
                  mode: 'insensitive',
                },
              },
              {
                vehiclePlate: {
                  contains: params.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    return where;
  }
}
