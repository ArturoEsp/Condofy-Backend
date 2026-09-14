import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import AccessAuthorizationsRepository, {
  AccessControlKpis,
  CreateAccessAuthorizationData,
  ParamsCountAccessAuthorizations,
  ParamsFindManyAccessAuthorizations,
  UpdateAccessAuthorizationData,
} from '../../domain/repositories/access-authorizations.repository';
import { AccessAuthorizationEntity } from '../../domain/entities/access-authorization.entity';
import { AccessAuthorizationEntityMapper } from '../mappers/access-authorization.mapper';
import { Prisma } from '@/core/infrastructure/persistence/prisma/generated/client';
import {
  AuthorizationStatus,
  AuthorizationType,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

@Injectable()
export class AccessAuthorizationsPrismaRepository implements AccessAuthorizationsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private async autoSyncAuthorizationsStatus(): Promise<void> {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    // 1. Expirar pases cuya fecha límite ya pasó o de un solo día anteriores a hoy
    await this.prismaService.accessAuthorization.updateMany({
      where: {
        status: AuthorizationStatus.ACTIVE,
        OR: [
          {
            validUntil: {
              lt: now,
            },
          },
          {
            type: AuthorizationType.ONE_TIME,
            validUntil: null,
            validFrom: {
              lt: startOfToday,
            },
          },
        ],
      },
      data: {
        status: AuthorizationStatus.EXPIRED,
      },
    });

    // 2. Activar pases pendientes cuya fecha de inicio ya fue alcanzada y siguen vigentes
    await this.prismaService.accessAuthorization.updateMany({
      where: {
        status: AuthorizationStatus.PENDING,
        validFrom: {
          lte: now,
        },
        OR: [{ validUntil: null }, { validUntil: { gte: now } }],
      },
      data: {
        status: AuthorizationStatus.ACTIVE,
      },
    });
  }

  async create(
    data: CreateAccessAuthorizationData,
  ): Promise<AccessAuthorizationEntity> {
    const access = await this.prismaService.accessAuthorization.create({
      data: {
        visitorId: data.visitorId,
        qrCode: data.qrCode,
        vehiclePlate: data.vehiclePlate,
        type: data.type,
        status: data.status,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        maxEntries: data.maxEntries,
        notes: data.notes,
      },
      include: {
        visitor: true,
        logs: {
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
      },
    });

    return AccessAuthorizationEntityMapper.toDomain(access);
  }

  async findOneById(id: string): Promise<AccessAuthorizationEntity | null> {
    await this.autoSyncAuthorizationsStatus();

    const access = await this.prismaService.accessAuthorization.findUnique({
      where: { id },
      include: {
        visitor: {
          include: {
            house: {
              include: {
                condominium: true,
              },
            },
          },
        },
        logs: {
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
      },
    });

    return access ? AccessAuthorizationEntityMapper.toDomain(access) : null;
  }

  async findOneByIdOrIdentifier(
    identifier: string,
  ): Promise<AccessAuthorizationEntity | null> {
    await this.autoSyncAuthorizationsStatus();

    const includeRelations = {
      visitor: {
        include: {
          house: {
            include: {
              condominium: true,
            },
          },
        },
      },
      logs: {
        orderBy: {
          date: 'desc' as const,
        },
        take: 1,
      },
    };

    // 1. Intentar buscar por ID directo
    let access = await this.prismaService.accessAuthorization.findUnique({
      where: { id: identifier },
      include: includeRelations,
    });

    // 2. Si no se encuentra y tiene formato tipo ACC-0001, buscar por index
    if (!access && identifier.toUpperCase().startsWith('ACC-')) {
      const indexNum = parseInt(identifier.substring(4), 10);
      if (!isNaN(indexNum)) {
        access = await this.prismaService.accessAuthorization.findFirst({
          where: { index: indexNum },
          include: includeRelations,
        });
      }
    }

    // 3. Si no se encuentra, buscar por qrCode (token / PIN)
    if (!access) {
      access = await this.prismaService.accessAuthorization.findUnique({
        where: { qrCode: identifier },
        include: includeRelations,
      });
    }

    return access ? AccessAuthorizationEntityMapper.toDomain(access) : null;
  }

  async findManyByHouseId(
    params: ParamsFindManyAccessAuthorizations,
  ): Promise<AccessAuthorizationEntity[]> {
    await this.autoSyncAuthorizationsStatus();

    const where = this.buildWhereInput(params);

    // Si se filtra específicamente por insideCondo, filtramos sobre los resultados con logs
    if (params.insideCondo !== undefined) {
      const allAccesses = await this.prismaService.accessAuthorization.findMany(
        {
          where,
          orderBy: {
            createdAt: params.orderBy ?? 'desc',
          },
          include: {
            visitor: true,
            logs: {
              orderBy: {
                date: 'desc',
              },
              take: 1,
            },
          },
        },
      );

      const mapped = allAccesses.map(AccessAuthorizationEntityMapper.toDomain);
      const filtered = mapped.filter(
        (item) => item.insideCondo === params.insideCondo,
      );

      const skip = (params.page - 1) * params.size;
      return filtered.slice(skip, skip + params.size);
    }

    const accesses = await this.prismaService.accessAuthorization.findMany({
      where,
      skip: (params.page - 1) * params.size,
      take: params.size,
      orderBy: {
        createdAt: params.orderBy ?? 'desc',
      },
      include: {
        visitor: true,
        logs: {
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
      },
    });

    return accesses.map(AccessAuthorizationEntityMapper.toDomain);
  }

  async countByHouseId(
    params: ParamsCountAccessAuthorizations,
  ): Promise<number> {
    await this.autoSyncAuthorizationsStatus();

    const where = this.buildWhereInput(params);

    if (params.insideCondo !== undefined) {
      const allAccesses = await this.prismaService.accessAuthorization.findMany(
        {
          where,
          include: {
            logs: {
              orderBy: {
                date: 'desc',
              },
              take: 1,
            },
          },
        },
      );

      const filtered = allAccesses.filter((acc) => {
        const isInside =
          acc.logs && acc.logs.length > 0 && acc.logs[0].entryType === 'ENTRY';
        return isInside === params.insideCondo;
      });

      return filtered.length;
    }

    return await this.prismaService.accessAuthorization.count({
      where,
    });
  }

  async getKpisByHouseId(houseId: string): Promise<AccessControlKpis> {
    await this.autoSyncAuthorizationsStatus();

    const accesses = await this.prismaService.accessAuthorization.findMany({
      where: {
        visitor: {
          houseId,
        },
      },
      select: {
        status: true,
        logs: {
          orderBy: {
            date: 'desc',
          },
          take: 1,
          select: {
            entryType: true,
          },
        },
      },
    });

    const total = accesses.length;
    let active = 0;
    let insideCondo = 0;
    let pending = 0;

    for (const acc of accesses) {
      if (acc.status === 'ACTIVE') active++;
      if (acc.status === 'PENDING') pending++;
      if (acc.logs.length > 0 && acc.logs[0].entryType === 'ENTRY') {
        insideCondo++;
      }
    }

    return {
      total,
      active,
      insideCondo,
      pending,
    };
  }

  async update(
    id: string,
    data: UpdateAccessAuthorizationData,
  ): Promise<AccessAuthorizationEntity> {
    const access = await this.prismaService.accessAuthorization.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.vehiclePlate !== undefined
          ? { vehiclePlate: data.vehiclePlate }
          : {}),
        ...(data.validUntil !== undefined
          ? { validUntil: data.validUntil }
          : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
      include: {
        visitor: true,
        logs: {
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
      },
    });

    return AccessAuthorizationEntityMapper.toDomain(access);
  }

  private buildWhereInput(
    params: ParamsCountAccessAuthorizations,
  ): Prisma.AccessAuthorizationWhereInput {
    const where: Prisma.AccessAuthorizationWhereInput = {
      visitor: {
        houseId: params.houseId,
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
      },
      ...(params.status ? { status: params.status } : {}),
      ...(params.type ? { type: params.type } : {}),
      ...(params.search
        ? {
            OR: [
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
