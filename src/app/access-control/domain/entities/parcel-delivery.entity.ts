import {
  CourierCompany,
  ParcelStatus,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export interface ParcelHouseInfo {
  id: string;
  houseNumber: string;
  tower?: string | null;
}

export interface ParcelUserInfo {
  id: string;
  email: string;
}

export class ParcelDeliveryEntity {
  id: string;
  condominiumId: string;
  houseId: string;
  house?: ParcelHouseInfo;
  courier: CourierCompany;
  customCourier?: string | null;
  trackingNumber?: string | null;
  packageCount: number;
  photoUrl?: string | null;
  notes?: string | null;
  pickupCode: string;
  status: ParcelStatus;
  receivedAt: Date;
  receivedById: string;
  receivedBy?: ParcelUserInfo;
  notifiedAt?: Date | null;
  notificationSent: boolean;
  deliveredAt?: Date | null;
  deliveredById?: string | null;
  deliveredBy?: ParcelUserInfo | null;
  deliveredToName?: string | null;
  deliveryNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ParcelDeliveryEntity>) {
    Object.assign(this, partial);
  }
}
