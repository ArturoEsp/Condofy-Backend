import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { Prisma } from '@/core/infrastructure/persistence/prisma/generated/client';
import {
  GeneralProviderAccessEntity,
  GeneralProviderCategory,
  GeneralProviderStatus,
} from '../../domain/entities/general-provider-access.entity';
import {
  CreateGeneralProviderAccessProps,
  ExitGeneralProviderAccessProps,
  GeneralProvidersRepository,
  PaginatedGeneralProvidersResult,
  ParamsFindGeneralProviders,
} from '../../domain/repositories/general-providers.repository';

@Injectable()
export class GeneralProvidersPrismaRepository implements GeneralProvidersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    props: CreateGeneralProviderAccessProps,
  ): Promise<GeneralProviderAccessEntity> {
    const created = await this.prismaService.generalProviderAccess.create({
      data: {
        condominiumId: props.condominiumId,
        name: props.name.trim(),
        category: props.category,
        driverName: props.driverName?.trim() || null,
        vehiclePlate: props.vehiclePlate?.trim() || null,
        companyPhone: props.companyPhone?.trim() || null,
        notes: props.notes?.trim() || null,
        status: GeneralProviderStatus.INSIDE,
        entryGuardId: props.entryGuardId,
      },
      include: {
        entryGuard: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<GeneralProviderAccessEntity | null> {
    const record = await this.prismaService.generalProviderAccess.findUnique({
      where: { id },
      include: {
        entryGuard: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        exitGuard: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return record ? this.mapToEntity(record) : null;
  }

  async findActive(
    condominiumId: string,
    search?: string,
  ): Promise<GeneralProviderAccessEntity[]> {
    let where: Prisma.GeneralProviderAccessWhereInput = {
      condominiumId,
      status: GeneralProviderStatus.INSIDE,
    };

    if (search && search.trim().length > 0) {
      const s = search.trim();
      where = {
        ...where,
        OR: [
          { name: { contains: s, mode: 'insensitive' } },
          { driverName: { contains: s, mode: 'insensitive' } },
          { vehiclePlate: { contains: s, mode: 'insensitive' } },
          { notes: { contains: s, mode: 'insensitive' } },
        ],
      };
    }

    const records = await this.prismaService.generalProviderAccess.findMany({
      where,
      orderBy: { enteredAt: 'desc' },
      include: {
        entryGuard: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return records.map((r) => this.mapToEntity(r));
  }

  async findHistory(
    params: ParamsFindGeneralProviders,
  ): Promise<PaginatedGeneralProvidersResult> {
    let where: Prisma.GeneralProviderAccessWhereInput = {
      condominiumId: params.condominiumId,
      ...(params.status ? { status: params.status } : {}),
      ...(params.category ? { category: params.category } : {}),
    };

    if (params.search && params.search.trim().length > 0) {
      const s = params.search.trim();
      where = {
        ...where,
        OR: [
          { name: { contains: s, mode: 'insensitive' } },
          { driverName: { contains: s, mode: 'insensitive' } },
          { vehiclePlate: { contains: s, mode: 'insensitive' } },
          { notes: { contains: s, mode: 'insensitive' } },
        ],
      };
    }

    const page = params.page ?? 1;
    const size = params.size ?? 15;
    const skip = (page - 1) * size;

    const [records, total] = await Promise.all([
      this.prismaService.generalProviderAccess.findMany({
        where,
        orderBy: { enteredAt: 'desc' },
        skip,
        take: size,
        include: {
          entryGuard: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          exitGuard: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prismaService.generalProviderAccess.count({ where }),
    ]);

    return {
      providers: records.map((r) => this.mapToEntity(r)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async registerExit(
    props: ExitGeneralProviderAccessProps,
  ): Promise<GeneralProviderAccessEntity> {
    const updated = await this.prismaService.generalProviderAccess.update({
      where: { id: props.id },
      data: {
        status: GeneralProviderStatus.EXITED,
        exitedAt: new Date(),
        exitGuardId: props.exitGuardId,
        exitNotes: props.exitNotes?.trim() || null,
      },
      include: {
        entryGuard: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        exitGuard: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return this.mapToEntity(updated);
  }

  async countActive(condominiumId: string): Promise<number> {
    return await this.prismaService.generalProviderAccess.count({
      where: {
        condominiumId,
        status: GeneralProviderStatus.INSIDE,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEntity(record: any): GeneralProviderAccessEntity {
    return {
      id: record.id,
      condominiumId: record.condominiumId,
      name: record.name,
      category: record.category as GeneralProviderCategory,
      driverName: record.driverName,
      vehiclePlate: record.vehiclePlate,
      companyPhone: record.companyPhone,
      notes: record.notes,
      status: record.status as GeneralProviderStatus,
      enteredAt: record.enteredAt,
      entryGuardId: record.entryGuardId,
      entryGuard: record.entryGuard,
      exitedAt: record.exitedAt,
      exitGuardId: record.exitGuardId,
      exitGuard: record.exitGuard,
      exitNotes: record.exitNotes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
