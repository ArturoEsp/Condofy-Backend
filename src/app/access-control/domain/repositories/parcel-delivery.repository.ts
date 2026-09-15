import {
  CourierCompany,
  ParcelStatus,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { ParcelDeliveryEntity } from '../entities/parcel-delivery.entity';

export interface CreateParcelData {
  condominiumId: string;
  houseId: string;
  courier: CourierCompany;
  customCourier?: string;
  trackingNumber?: string;
  packageCount?: number;
  photoUrl?: string;
  notes?: string;
  pickupCode: string;
  receivedById: string;
}

export interface DeliverParcelData {
  parcelId: string;
  condominiumId: string;
  deliveredById: string;
  deliveredToName: string;
  deliveryNotes?: string;
}

export interface ParamsFindParcels {
  condominiumId: string;
  houseId?: string;
  status?: ParcelStatus;
  search?: string;
  page?: number;
  size?: number;
}

export interface ParcelsListResult {
  parcels: ParcelDeliveryEntity[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ParcelStatsResult {
  inCustodyCount: number;
  deliveredTodayCount: number;
  totalDeliveredCount: number;
}

export default interface ParcelDeliveryRepository {
  create(data: CreateParcelData): Promise<ParcelDeliveryEntity>;
  findById(
    id: string,
    condominiumId: string,
  ): Promise<ParcelDeliveryEntity | null>;
  findByPickupCode(
    condominiumId: string,
    pickupCode: string,
  ): Promise<ParcelDeliveryEntity | null>;
  deliver(data: DeliverParcelData): Promise<ParcelDeliveryEntity>;
  markNotified(id: string): Promise<void>;
  findParcels(params: ParamsFindParcels): Promise<ParcelsListResult>;
  getStats(condominiumId: string): Promise<ParcelStatsResult>;
}
