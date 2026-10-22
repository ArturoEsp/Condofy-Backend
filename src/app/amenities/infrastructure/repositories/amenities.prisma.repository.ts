import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@/core/infrastructure/persistence/prisma/generated/client';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { StorageService } from '@/core/domain/services/storage.service';
import { AmenitiesRepository } from '../../domain/repositories/amenities.repository';
import {
  AmenityEntity,
  AmenityProps,
} from '../../domain/entities/amenity.entity';
import {
  AmenityBlockPeriodEntity,
  AmenityBlockPeriodProps,
} from '../../domain/entities/amenity-block-period.entity';
import {
  AmenityMapper,
  PrismaAmenityWithRelations,
} from '../mappers/amenity.mapper';

@Injectable()
export class AmenitiesPrismaRepository implements AmenitiesRepository {
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

  private async resolveUrl(
    rawUrlOrKey?: string | null,
  ): Promise<string | null> {
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

  private async resolveUrls(photos: string[]): Promise<string[]> {
    if (!photos || photos.length === 0) return [];
    return Promise.all(
      photos.map(async (photo) => {
        const resolved = await this.resolveUrl(photo);
        return resolved || photo;
      }),
    );
  }

  private async mapToDomain(
    raw: PrismaAmenityWithRelations,
  ): Promise<AmenityEntity> {
    const domain = AmenityMapper.toDomain(raw);
    const resolvedRules = await this.resolveUrl(domain.rulesDocumentUrl);
    const resolvedPhotos = await this.resolveUrls(domain.photos);

    return new AmenityEntity({
      ...domain,
      rulesDocumentUrl: resolvedRules,
      photos: resolvedPhotos,
    });
  }

  async create(
    data: Omit<
      AmenityProps,
      'id' | 'createdAt' | 'updatedAt' | 'totalReservations'
    >,
  ): Promise<AmenityEntity> {
    const created = await this.prisma.amenity.create({
      data: {
        condominiumId: data.condominiumId,
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        isActive: data.isActive,
        cost: new Prisma.Decimal(data.cost),
        requiresDeposit: data.requiresDeposit,
        depositAmount:
          data.depositAmount !== null && data.depositAmount !== undefined
            ? new Prisma.Decimal(data.depositAmount)
            : null,
        rulesDocumentUrl: data.rulesDocumentUrl,
        rulesDocumentName: data.rulesDocumentName,
        rulesText: data.rulesText,
        photos: data.photos,
        reservationType: data.reservationType,
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        availableDays: data.availableDays,
        minNoticeHours: data.minNoticeHours,
        maxNoticeDays: data.maxNoticeDays,
        maxHoursPerReservation: data.maxHoursPerReservation,
        requiresApproval: data.requiresApproval,
      },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    return this.mapToDomain(created);
  }

  async update(
    id: string,
    condominiumId: string,
    data: Partial<
      Omit<
        AmenityProps,
        'id' | 'condominiumId' | 'createdAt' | 'updatedAt' | 'totalReservations'
      >
    >,
  ): Promise<AmenityEntity> {
    const existing = await this.prisma.amenity.findFirst({
      where: { id, condominiumId },
    });

    if (!existing) {
      throw new NotFoundException('La amenidad especificada no existe');
    }

    const updateData: Prisma.AmenityUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.cost !== undefined)
      updateData.cost = new Prisma.Decimal(data.cost);
    if (data.requiresDeposit !== undefined)
      updateData.requiresDeposit = data.requiresDeposit;
    if (data.depositAmount !== undefined) {
      updateData.depositAmount =
        data.depositAmount !== null
          ? new Prisma.Decimal(data.depositAmount)
          : null;
    }
    if (data.rulesDocumentUrl !== undefined)
      updateData.rulesDocumentUrl = data.rulesDocumentUrl;
    if (data.rulesDocumentName !== undefined)
      updateData.rulesDocumentName = data.rulesDocumentName;
    if (data.rulesText !== undefined) updateData.rulesText = data.rulesText;
    if (data.photos !== undefined) updateData.photos = data.photos;
    if (data.reservationType !== undefined)
      updateData.reservationType = data.reservationType;
    if (data.openingTime !== undefined)
      updateData.openingTime = data.openingTime;
    if (data.closingTime !== undefined)
      updateData.closingTime = data.closingTime;
    if (data.availableDays !== undefined)
      updateData.availableDays = data.availableDays;
    if (data.minNoticeHours !== undefined)
      updateData.minNoticeHours = data.minNoticeHours;
    if (data.maxNoticeDays !== undefined)
      updateData.maxNoticeDays = data.maxNoticeDays;
    if (data.maxHoursPerReservation !== undefined)
      updateData.maxHoursPerReservation = data.maxHoursPerReservation;
    if (data.requiresApproval !== undefined)
      updateData.requiresApproval = data.requiresApproval;

    const updated = await this.prisma.amenity.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    return this.mapToDomain(updated);
  }

  async findById(
    id: string,
    condominiumId: string,
  ): Promise<AmenityEntity | null> {
    const found = await this.prisma.amenity.findFirst({
      where: { id, condominiumId },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    if (!found) return null;
    return this.mapToDomain(found);
  }

  async findAll(
    condominiumId: string,
    onlyActive: boolean = false,
  ): Promise<AmenityEntity[]> {
    const where: Prisma.AmenityWhereInput = { condominiumId };
    if (onlyActive) {
      where.isActive = true;
    }

    const amenities = await this.prisma.amenity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    return Promise.all(amenities.map((a) => this.mapToDomain(a)));
  }

  async delete(id: string, condominiumId: string): Promise<void> {
    const existing = await this.prisma.amenity.findFirst({
      where: { id, condominiumId },
    });

    if (!existing) {
      throw new NotFoundException('La amenidad especificada no existe');
    }

    await this.prisma.amenity.delete({
      where: { id },
    });
  }

  async createBlock(
    data: Omit<AmenityBlockPeriodProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<AmenityBlockPeriodEntity> {
    const created = await this.prisma.amenityBlockPeriod.create({
      data: {
        amenityId: data.amenityId,
        condominiumId: data.condominiumId,
        title: data.title,
        reason: data.reason,
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        createdBy: data.createdBy,
      },
    });

    return AmenityMapper.blockToDomain(created);
  }

  async deleteBlock(blockId: string, condominiumId: string): Promise<void> {
    const existing = await this.prisma.amenityBlockPeriod.findFirst({
      where: { id: blockId, condominiumId },
    });

    if (!existing) {
      throw new NotFoundException('El bloqueo de fecha no existe');
    }

    await this.prisma.amenityBlockPeriod.delete({
      where: { id: blockId },
    });
  }

  async findBlocks(
    amenityId: string | undefined,
    condominiumId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AmenityBlockPeriodEntity[]> {
    const where: Prisma.AmenityBlockPeriodWhereInput = {
      condominiumId,
    };

    if (amenityId) {
      where.amenityId = amenityId;
    }

    if (startDate && endDate) {
      where.AND = [
        { startDate: { lte: endDate } },
        { endDate: { gte: startDate } },
      ];
    }

    const blocks = await this.prisma.amenityBlockPeriod.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });

    return blocks.map((b) => AmenityMapper.blockToDomain(b));
  }
}
