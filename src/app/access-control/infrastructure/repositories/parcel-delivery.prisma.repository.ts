import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import ParcelDeliveryRepository, {
  CreateParcelData,
  DeliverParcelData,
  ParamsFindParcels,
  ParcelsListResult,
  ParcelStatsResult,
} from '../../domain/repositories/parcel-delivery.repository';
import { ParcelDeliveryEntity } from '../../domain/entities/parcel-delivery.entity';
import {
  ParcelStatus,
  Prisma,
} from '@/core/infrastructure/persistence/prisma/generated/client';

@Injectable()
export class ParcelDeliveryPrismaRepository implements ParcelDeliveryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private mapToEntity(parcel: any): ParcelDeliveryEntity {
    return new ParcelDeliveryEntity({
      id: parcel.id,
      condominiumId: parcel.condominiumId,
      houseId: parcel.houseId,
      house: parcel.house
        ? {
            id: parcel.house.id,
            houseNumber: parcel.house.houseNumber,
            tower: parcel.house.tower,
          }
        : undefined,
      courier: parcel.courier,
      customCourier: parcel.customCourier,
      trackingNumber: parcel.trackingNumber,
      packageCount: parcel.packageCount,
      photoUrl: parcel.photoUrl,
      notes: parcel.notes,
      pickupCode: parcel.pickupCode,
      status: parcel.status,
      receivedAt: parcel.receivedAt,
      receivedById: parcel.receivedById,
      receivedBy: parcel.receivedBy
        ? {
            id: parcel.receivedBy.id,
            email: parcel.receivedBy.email,
          }
        : undefined,
      notifiedAt: parcel.notifiedAt,
      notificationSent: parcel.notificationSent,
      deliveredAt: parcel.deliveredAt,
      deliveredById: parcel.deliveredById,
      deliveredBy: parcel.deliveredBy
        ? {
            id: parcel.deliveredBy.id,
            email: parcel.deliveredBy.email,
          }
        : undefined,
      deliveredToName: parcel.deliveredToName,
      deliveryNotes: parcel.deliveryNotes,
      createdAt: parcel.createdAt,
      updatedAt: parcel.updatedAt,
    });
  }

  async create(data: CreateParcelData): Promise<ParcelDeliveryEntity> {
    const parcel = await this.prismaService.parcelDelivery.create({
      data: {
        condominiumId: data.condominiumId,
        houseId: data.houseId,
        courier: data.courier,
        customCourier: data.customCourier ?? null,
        trackingNumber: data.trackingNumber ?? null,
        packageCount: data.packageCount ?? 1,
        photoUrl: data.photoUrl ?? null,
        notes: data.notes ?? null,
        pickupCode: data.pickupCode,
        receivedById: data.receivedById,
        status: ParcelStatus.IN_CUSTODY,
      },
      include: {
        house: true,
        receivedBy: {
          select: { id: true, email: true },
        },
      },
    });

    return this.mapToEntity(parcel);
  }

  async findById(
    id: string,
    condominiumId: string,
  ): Promise<ParcelDeliveryEntity | null> {
    const parcel = await this.prismaService.parcelDelivery.findFirst({
      where: { id, condominiumId },
      include: {
        house: true,
        receivedBy: {
          select: { id: true, email: true },
        },
        deliveredBy: {
          select: { id: true, email: true },
        },
      },
    });

    return parcel ? this.mapToEntity(parcel) : null;
  }

  async findByPickupCode(
    condominiumId: string,
    pickupCode: string,
  ): Promise<ParcelDeliveryEntity | null> {
    const parcel = await this.prismaService.parcelDelivery.findFirst({
      where: {
        condominiumId,
        pickupCode: pickupCode.trim(),
        status: ParcelStatus.IN_CUSTODY,
      },
      include: {
        house: true,
        receivedBy: {
          select: { id: true, email: true },
        },
        deliveredBy: {
          select: { id: true, email: true },
        },
      },
    });

    return parcel ? this.mapToEntity(parcel) : null;
  }

  async deliver(data: DeliverParcelData): Promise<ParcelDeliveryEntity> {
    const parcel = await this.prismaService.parcelDelivery.update({
      where: {
        id: data.parcelId,
      },
      data: {
        status: ParcelStatus.DELIVERED,
        deliveredAt: new Date(),
        deliveredById: data.deliveredById,
        deliveredToName: data.deliveredToName,
        deliveryNotes: data.deliveryNotes ?? null,
      },
      include: {
        house: true,
        receivedBy: {
          select: { id: true, email: true },
        },
        deliveredBy: {
          select: { id: true, email: true },
        },
      },
    });

    return this.mapToEntity(parcel);
  }

  async markNotified(id: string): Promise<void> {
    await this.prismaService.parcelDelivery.update({
      where: { id },
      data: {
        notifiedAt: new Date(),
        notificationSent: true,
      },
    });
  }

  async findParcels(params: ParamsFindParcels): Promise<ParcelsListResult> {
    const page = params.page ?? 1;
    const size = params.size ?? 15;
    const skip = (page - 1) * size;

    const where: Prisma.ParcelDeliveryWhereInput = {
      condominiumId: params.condominiumId,
      ...(params.houseId ? { houseId: params.houseId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.search
        ? {
            OR: [
              {
                trackingNumber: {
                  contains: params.search,
                  mode: 'insensitive',
                },
              },
              {
                customCourier: {
                  contains: params.search,
                  mode: 'insensitive',
                },
              },
              {
                pickupCode: {
                  contains: params.search,
                  mode: 'insensitive',
                },
              },
              {
                deliveredToName: {
                  contains: params.search,
                  mode: 'insensitive',
                },
              },
              {
                house: {
                  houseNumber: {
                    contains: params.search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [parcels, total] = await Promise.all([
      this.prismaService.parcelDelivery.findMany({
        where,
        orderBy: { receivedAt: 'desc' },
        skip,
        take: size,
        include: {
          house: true,
          receivedBy: {
            select: { id: true, email: true },
          },
          deliveredBy: {
            select: { id: true, email: true },
          },
        },
      }),
      this.prismaService.parcelDelivery.count({ where }),
    ]);

    return {
      parcels: parcels.map((p) => this.mapToEntity(p)),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getStats(condominiumId: string): Promise<ParcelStatsResult> {
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

    const [inCustodyCount, deliveredTodayCount, totalDeliveredCount] =
      await Promise.all([
        this.prismaService.parcelDelivery.count({
          where: {
            condominiumId,
            status: ParcelStatus.IN_CUSTODY,
          },
        }),
        this.prismaService.parcelDelivery.count({
          where: {
            condominiumId,
            status: ParcelStatus.DELIVERED,
            deliveredAt: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        }),
        this.prismaService.parcelDelivery.count({
          where: {
            condominiumId,
            status: ParcelStatus.DELIVERED,
          },
        }),
      ]);

    return {
      inCustodyCount,
      deliveredTodayCount,
      totalDeliveredCount,
    };
  }
}
