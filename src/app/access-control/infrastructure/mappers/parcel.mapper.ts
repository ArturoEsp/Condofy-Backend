import { ParcelDeliveryEntity } from '../../domain/entities/parcel-delivery.entity';
import {
  ListParcelsResponse,
  ParcelResponse,
  ParcelStatsResponse,
} from '../../presentation/dtos/responses/parcel.response';
import {
  ParcelsListResult,
  ParcelStatsResult,
} from '../../domain/repositories/parcel-delivery.repository';

export class ParcelResponseMapper {
  static toResponse(entity: ParcelDeliveryEntity): ParcelResponse {
    return {
      id: entity.id,
      condominiumId: entity.condominiumId,
      houseId: entity.houseId,
      house: entity.house
        ? {
            id: entity.house.id,
            houseNumber: entity.house.houseNumber,
            tower: entity.house.tower,
          }
        : undefined,
      courier: entity.courier,
      customCourier: entity.customCourier,
      trackingNumber: entity.trackingNumber,
      packageCount: entity.packageCount,
      photoUrl: entity.photoUrl,
      notes: entity.notes,
      pickupCode: entity.pickupCode,
      status: entity.status,
      receivedAt: entity.receivedAt,
      receivedById: entity.receivedById,
      receivedBy: entity.receivedBy
        ? {
            id: entity.receivedBy.id,
            email: entity.receivedBy.email,
          }
        : undefined,
      notifiedAt: entity.notifiedAt,
      notificationSent: entity.notificationSent,
      deliveredAt: entity.deliveredAt,
      deliveredById: entity.deliveredById,
      deliveredBy: entity.deliveredBy
        ? {
            id: entity.deliveredBy.id,
            email: entity.deliveredBy.email,
          }
        : undefined,
      deliveredToName: entity.deliveredToName,
      deliveryNotes: entity.deliveryNotes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toListResponse(result: ParcelsListResult): ListParcelsResponse {
    return {
      parcels: result.parcels.map((p) => this.toResponse(p)),
      total: result.total,
      page: result.page,
      size: result.size,
      totalPages: result.totalPages,
    };
  }

  static toStatsResponse(stats: ParcelStatsResult): ParcelStatsResponse {
    return {
      inCustodyCount: stats.inCustodyCount,
      deliveredTodayCount: stats.deliveredTodayCount,
      totalDeliveredCount: stats.totalDeliveredCount,
    };
  }
}
