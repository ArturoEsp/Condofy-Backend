import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import AccessLogsRepository, {
  AccessLogItemEntity,
  ActiveEntryItemEntity,
  CreateAccessLogData,
  ParamsFindAccessLogs,
  ResidentAccessLogEntity,
  StandAccessLogsResult,
  StandDashboardStats,
} from '../../domain/repositories/access-logs.repository';
import {
  AuthorizationStatus,
  EntryType,
  Prisma,
} from '@/core/infrastructure/persistence/prisma/generated/client';

@Injectable()
export class AccessLogsPrismaRepository implements AccessLogsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateAccessLogData): Promise<AccessLogItemEntity> {
    const log = await this.prismaService.$transaction(async (tx) => {
      // 1. Crear el log de acceso
      const createdLog = await tx.accessLog.create({
        data: {
          accessAuthorizationId: data.accessAuthorizationId,
          entryType: data.entryType,
          observations: data.observations ?? null,
          userAcceptId: data.userAcceptId,
        },
        include: {
          userAccept: {
            select: {
              id: true,
              email: true,
            },
          },
          authorization: {
            include: {
              visitor: {
                include: {
                  house: true,
                },
              },
            },
          },
        },
      });

      // 2. Si es entrada, actualizar conteo de entradas
      if (data.entryType === EntryType.ENTRY) {
        const auth = await tx.accessAuthorization.findUnique({
          where: { id: data.accessAuthorizationId },
          select: { maxEntries: true, usedEntries: true },
        });

        if (auth) {
          const newUsedEntries = auth.usedEntries + 1;
          const shouldMarkAsUsed =
            auth.maxEntries !== null && newUsedEntries >= auth.maxEntries;

          await tx.accessAuthorization.update({
            where: { id: data.accessAuthorizationId },
            data: {
              usedEntries: newUsedEntries,
              ...(shouldMarkAsUsed ? { status: AuthorizationStatus.USED } : {}),
            },
          });
        }
      }

      return createdLog;
    });

    return this.mapToEntity(log);
  }

  async findTodayLogs(
    params: ParamsFindAccessLogs,
  ): Promise<StandAccessLogsResult> {
    const now = new Date();
    let startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    if (params.date) {
      const parts = params.date.split('-');
      if (parts.length === 3) {
        startDate = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10),
          0,
          0,
          0,
          0,
        );
      }
    }

    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);

    const where: Prisma.AccessLogWhereInput = {
      authorization: {
        visitor: {
          house: {
            condominiumId: params.condominiumId,
          },
        },
      },
      date: {
        gte: startDate,
        lte: endDate,
      },
      ...(params.entryType ? { entryType: params.entryType } : {}),
      ...(params.search
        ? {
            OR: [
              {
                authorization: {
                  visitor: {
                    firstName: {
                      contains: params.search,
                      mode: 'insensitive',
                    },
                  },
                },
              },
              {
                authorization: {
                  visitor: {
                    lastName: {
                      contains: params.search,
                      mode: 'insensitive',
                    },
                  },
                },
              },
              {
                authorization: {
                  vehiclePlate: {
                    contains: params.search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                observations: {
                  contains: params.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const page = params.page ?? 1;
    const size = params.size ?? 15;
    const skip = (page - 1) * size;

    const [logs, total] = await Promise.all([
      this.prismaService.accessLog.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: size,
        include: {
          userAccept: {
            select: {
              id: true,
              email: true,
            },
          },
          authorization: {
            include: {
              visitor: {
                include: {
                  house: true,
                },
              },
            },
          },
        },
      }),
      this.prismaService.accessLog.count({ where }),
    ]);

    return {
      logs: logs.map((l) => this.mapToEntity(l)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async findActiveEntries(
    condominiumId: string,
    search?: string,
  ): Promise<ActiveEntryItemEntity[]> {
    let where: Prisma.AccessAuthorizationWhereInput = {
      visitor: {
        house: {
          condominiumId,
        },
      },
      logs: {
        some: {
          entryType: EntryType.ENTRY,
        },
      },
    };

    if (search && search.trim().length > 0) {
      const s = search.trim();
      const orConditions: Prisma.AccessAuthorizationWhereInput[] = [
        { visitor: { firstName: { contains: s, mode: 'insensitive' } } },
        { visitor: { lastName: { contains: s, mode: 'insensitive' } } },
        { visitor: { phone: { contains: s, mode: 'insensitive' } } },
        {
          visitor: {
            house: { houseNumber: { contains: s, mode: 'insensitive' } },
          },
        },
        { vehiclePlate: { contains: s, mode: 'insensitive' } },
        { qrCode: { contains: s, mode: 'insensitive' } },
      ];

      if (s.toUpperCase().startsWith('ACC-')) {
        const indexNum = parseInt(s.substring(4), 10);
        if (!isNaN(indexNum)) {
          orConditions.push({ index: indexNum });
        }
      }

      where = {
        ...where,
        OR: orConditions,
      };
    }

    const accesses = await this.prismaService.accessAuthorization.findMany({
      where,
      include: {
        visitor: {
          include: {
            house: true,
          },
        },
        logs: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const activeAccesses = accesses.filter(
      (acc) => acc.logs.length > 0 && acc.logs[0].entryType === EntryType.ENTRY,
    );

    activeAccesses.sort(
      (a, b) => b.logs[0].date.getTime() - a.logs[0].date.getTime(),
    );

    return activeAccesses.map((acc) => {
      const code = `ACC-${String(acc.index).padStart(4, '0')}`;
      const lastLog = acc.logs[0];

      return {
        accessAuthorizationId: acc.id,
        code,
        pin: acc.qrCode,
        type: acc.type,
        status: acc.status,
        vehiclePlate: acc.vehiclePlate,
        notes: acc.notes,
        visitor: acc.visitor
          ? {
              id: acc.visitor.id,
              firstName: acc.visitor.firstName,
              lastName: acc.visitor.lastName,
              category: acc.visitor.category,
              photo: acc.visitor.photo,
              phone: acc.visitor.phone,
            }
          : undefined,
        house: acc.visitor?.house
          ? {
              id: acc.visitor.house.id,
              houseNumber: acc.visitor.house.houseNumber,
              tower: acc.visitor.house.tower,
            }
          : undefined,
        entryDate: lastLog.date,
        entryObservations: lastLog.observations,
        entryLogId: lastLog.id,
      };
    });
  }

  async getDashboardStats(condominiumId: string): Promise<StandDashboardStats> {
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
    const endOfToday = new Date(
      startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1,
    );

    const [todayEntriesCount, todayExitsCount, allAccesses] = await Promise.all(
      [
        this.prismaService.accessLog.count({
          where: {
            entryType: EntryType.ENTRY,
            date: { gte: startOfToday, lte: endOfToday },
            authorization: {
              visitor: { house: { condominiumId } },
            },
          },
        }),
        this.prismaService.accessLog.count({
          where: {
            entryType: EntryType.EXIT,
            date: { gte: startOfToday, lte: endOfToday },
            authorization: {
              visitor: { house: { condominiumId } },
            },
          },
        }),
        this.prismaService.accessAuthorization.findMany({
          where: {
            visitor: { house: { condominiumId } },
          },
          select: {
            logs: {
              orderBy: { date: 'desc' },
              take: 1,
              select: { entryType: true },
            },
          },
        }),
      ],
    );

    const insideCount = allAccesses.filter(
      (acc) => acc.logs.length > 0 && acc.logs[0].entryType === EntryType.ENTRY,
    ).length;

    return {
      insideCount,
      todayEntriesCount,
      todayExitsCount,
    };
  }

  private mapToEntity(log: any): AccessLogItemEntity {
    const auth = log.authorization;
    const code = `ACC-${String(auth.index).padStart(4, '0')}`;

    return {
      id: log.id,
      accessAuthorizationId: log.accessAuthorizationId,
      entryType: log.entryType,
      observations: log.observations,
      date: log.date,
      userAccept: {
        id: log.userAccept.id,
        email: log.userAccept.email,
      },
      authorization: {
        id: auth.id,
        code,
        pin: auth.qrCode,
        vehiclePlate: auth.vehiclePlate,
        type: auth.type,
        status: auth.status,
        notes: auth.notes,
        visitor: auth.visitor
          ? {
              firstName: auth.visitor.firstName,
              lastName: auth.visitor.lastName,
              category: auth.visitor.category,
              photo: auth.visitor.photo,
              phone: auth.visitor.phone,
            }
          : undefined,
        house: auth.visitor?.house
          ? {
              houseNumber: auth.visitor.house.houseNumber,
              tower: auth.visitor.house.tower,
            }
          : undefined,
      },
    };
  }

  async findLogsByAuthorizationId(
    accessAuthorizationId: string,
  ): Promise<ResidentAccessLogEntity[]> {
    const logs = await this.prismaService.accessLog.findMany({
      where: { accessAuthorizationId },
      orderBy: { date: 'desc' },
      include: {
        userAccept: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return logs.map((log) => {
      const firstName = log.userAccept.firstName?.trim() || '';
      const lastName = log.userAccept.lastName?.trim() || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const name =
        fullName ||
        (log.userAccept.role === 'STAND'
          ? 'Oficial en caseta'
          : log.userAccept.role === 'ADMIN'
            ? 'Administración'
            : log.userAccept.email);

      return {
        id: log.id,
        accessAuthorizationId: log.accessAuthorizationId,
        entryType: log.entryType,
        observations: log.observations,
        date: log.date,
        userAccept: {
          id: log.userAccept.id,
          name,
          email: log.userAccept.email,
          role: log.userAccept.role,
        },
      };
    });
  }
}
