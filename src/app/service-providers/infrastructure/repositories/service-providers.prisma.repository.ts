import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@/core/infrastructure/persistence/prisma/generated/client';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { StorageService } from '@/core/domain/services/storage.service';
import {
  CreateServiceProviderData,
  FindAllServiceProvidersParams,
  ServiceProvidersRepository,
  UpdateServiceProviderData,
} from '../../domain/repositories/service-providers.repository';
import { ServiceProviderEntity } from '../../domain/entities/service-provider.entity';
import {
  PrismaServiceProviderWithRelations,
  ServiceProviderMapper,
} from '../mappers/service-provider.mapper';

@Injectable()
export class ServiceProvidersPrismaRepository
  implements ServiceProvidersRepository
{
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PROVIDES_NAMES.StorageService)
    private readonly storageService: StorageService,
  ) {}

  private extractStorageKey(urlOrKey: string): string {
    if (!urlOrKey) return '';
    const trimmed = urlOrKey.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const parsed = new URL(trimmed);
        let cleanPath = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
        if (cleanPath.startsWith('condofy-private/')) {
          cleanPath = cleanPath.replace(/^condofy-private\//, '');
        }
        return cleanPath;
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  private async resolveImageUrl(rawUrlOrKey?: string | null): Promise<string | null> {
    if (!rawUrlOrKey) return null;
    const key = this.extractStorageKey(rawUrlOrKey);
    if (key.startsWith('condominiums/')) {
      try {
        return await this.storageService.getPresignedUrl(key, 604800);
      } catch {
        return rawUrlOrKey;
      }
    }
    return rawUrlOrKey;
  }

  private async mapToDomain(
    raw: PrismaServiceProviderWithRelations,
    currentUserId?: string,
  ): Promise<ServiceProviderEntity> {
    const domain = ServiceProviderMapper.toDomain(raw, currentUserId);
    const resolvedUrl = await this.resolveImageUrl(domain.imageUrl);

    return new ServiceProviderEntity({
      ...domain,
      imageUrl: resolvedUrl,
    });
  }

  async create(data: CreateServiceProviderData): Promise<ServiceProviderEntity> {
    const created = await this.prisma.serviceProvider.create({
      data: {
        condominiumId: data.condominiumId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        category: data.category,
        type: data.type ?? 'COMMUNITY',
        imageUrl: data.imageUrl || null,
        phone: data.phone?.trim() || null,
        whatsapp: data.whatsapp?.trim() || null,
        email: data.email?.trim() || null,
        website: data.website?.trim() || null,
        schedule: data.schedule?.trim() || null,
        address: data.address?.trim() || null,
        isActive: data.isActive ?? true,
        createdById: data.createdById,
      },
      include: {
        _count: {
          select: { likes: true },
        },
      },
    });

    return this.mapToDomain(created);
  }

  async findById(
    id: string,
    condominiumId: string,
    currentUserId?: string,
  ): Promise<ServiceProviderEntity | null> {
    const provider = await this.prisma.serviceProvider.findFirst({
      where: {
        id,
        condominiumId,
      },
      include: {
        _count: {
          select: { likes: true },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true, userId: true },
            }
          : false,
      },
    });

    if (!provider) return null;

    return this.mapToDomain(
      provider as unknown as PrismaServiceProviderWithRelations,
      currentUserId,
    );
  }

  async findAll(
    params: FindAllServiceProvidersParams,
  ): Promise<{
    providers: ServiceProviderEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, Math.min(100, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceProviderWhereInput = {
      condominiumId: params.condominiumId,
    };

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.type) {
      where.type = params.type;
    }

    if (params.search) {
      const search = params.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (params.onlyLiked && params.currentUserId) {
      where.likes = {
        some: {
          userId: params.currentUserId,
        },
      };
    }

    let orderBy: Prisma.ServiceProviderOrderByWithRelationInput = {
      createdAt: 'desc',
    };

    if (params.sortBy === 'likes') {
      orderBy = {
        likes: {
          _count: 'desc',
        },
      };
    } else if (params.sortBy === 'name') {
      orderBy = {
        name: 'asc',
      };
    } else if (params.sortBy === 'recent') {
      orderBy = {
        createdAt: 'desc',
      };
    }

    const [total, records] = await Promise.all([
      this.prisma.serviceProvider.count({ where }),
      this.prisma.serviceProvider.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: { likes: true },
          },
          likes: params.currentUserId
            ? {
                where: { userId: params.currentUserId },
                select: { id: true, userId: true },
              }
            : false,
        },
      }),
    ]);

    const providers = await Promise.all(
      records.map((item) =>
        this.mapToDomain(
          item as unknown as PrismaServiceProviderWithRelations,
          params.currentUserId,
        ),
      ),
    );

    return {
      providers,
      total,
      page,
      limit,
    };
  }

  async update(
    id: string,
    condominiumId: string,
    data: UpdateServiceProviderData,
  ): Promise<ServiceProviderEntity> {
    const existing = await this.prisma.serviceProvider.findFirst({
      where: { id, condominiumId },
    });

    if (!existing) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    if (data.imageUrl === null && existing.imageUrl) {
      const oldKey = this.extractStorageKey(existing.imageUrl);
      if (oldKey.startsWith('condominiums/')) {
        try {
          await this.storageService.deleteFile(oldKey);
        } catch {
          // ignorar error si ya no existía en S3
        }
      }
    }

    const updated = await this.prisma.serviceProvider.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined
          ? { description: data.description?.trim() || null }
          : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl || null } : {}),
        ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
        ...(data.whatsapp !== undefined
          ? { whatsapp: data.whatsapp?.trim() || null }
          : {}),
        ...(data.email !== undefined ? { email: data.email?.trim() || null } : {}),
        ...(data.website !== undefined
          ? { website: data.website?.trim() || null }
          : {}),
        ...(data.schedule !== undefined
          ? { schedule: data.schedule?.trim() || null }
          : {}),
        ...(data.address !== undefined
          ? { address: data.address?.trim() || null }
          : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
      include: {
        _count: {
          select: { likes: true },
        },
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: string, condominiumId: string): Promise<void> {
    const existing = await this.prisma.serviceProvider.findFirst({
      where: { id, condominiumId },
    });

    if (!existing) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    await this.prisma.serviceProvider.delete({
      where: { id },
    });
  }

  async toggleLike(
    providerId: string,
    userId: string,
  ): Promise<{ hasLiked: boolean; likesCount: number }> {
    const provider = await this.prisma.serviceProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    const existingLike = await this.prisma.serviceProviderLike.findUnique({
      where: {
        providerId_userId: {
          providerId,
          userId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.serviceProviderLike.delete({
        where: { id: existingLike.id },
      });
    } else {
      await this.prisma.serviceProviderLike.create({
        data: {
          providerId,
          userId,
        },
      });
    }

    const likesCount = await this.prisma.serviceProviderLike.count({
      where: { providerId },
    });

    return {
      hasLiked: !existingLike,
      likesCount,
    };
  }
}

