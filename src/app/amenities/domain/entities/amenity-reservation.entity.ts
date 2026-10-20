import {
  AmenityReservationStatus,
  AmenityPaymentStatus,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export interface AmenityReservationResidentInfo {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone?: string | null;
}

export interface AmenityReservationHouseInfo {
  id: string;
  houseNumber: string;
  tower?: string | null;
}

export interface AmenityReservationAmenityInfo {
  id: string;
  name: string;
  cost: number;
  requiresDeposit: boolean;
  depositAmount?: number | null;
  photos: string[];
}

export interface AmenityReservationProps {
  id: string;
  amenityId: string;
  condominiumId: string;
  residentId: string;
  houseId: string;
  reservationDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  status: AmenityReservationStatus;
  totalCost: number;
  depositAmount: number;
  paymentStatus: AmenityPaymentStatus;
  notes?: string | null;
  adminNotes?: string | null;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  cancelledAt?: Date | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  resident?: AmenityReservationResidentInfo;
  house?: AmenityReservationHouseInfo;
  amenity?: AmenityReservationAmenityInfo;
}

export class AmenityReservationEntity {
  readonly id: string;
  readonly amenityId: string;
  readonly condominiumId: string;
  readonly residentId: string;
  readonly houseId: string;
  readonly reservationDate: Date;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly status: AmenityReservationStatus;
  readonly totalCost: number;
  readonly depositAmount: number;
  readonly paymentStatus: AmenityPaymentStatus;
  readonly notes: string | null;
  readonly adminNotes: string | null;
  readonly approvedAt: Date | null;
  readonly approvedBy: string | null;
  readonly cancelledAt: Date | null;
  readonly cancelledBy: string | null;
  readonly cancellationReason: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly resident?: AmenityReservationResidentInfo;
  readonly house?: AmenityReservationHouseInfo;
  readonly amenity?: AmenityReservationAmenityInfo;

  constructor(props: AmenityReservationProps) {
    this.id = props.id;
    this.amenityId = props.amenityId;
    this.condominiumId = props.condominiumId;
    this.residentId = props.residentId;
    this.houseId = props.houseId;
    this.reservationDate = props.reservationDate;
    this.startTime = props.startTime ?? null;
    this.endTime = props.endTime ?? null;
    this.status = props.status;
    this.totalCost = props.totalCost;
    this.depositAmount = props.depositAmount;
    this.paymentStatus = props.paymentStatus;
    this.notes = props.notes ?? null;
    this.adminNotes = props.adminNotes ?? null;
    this.approvedAt = props.approvedAt ?? null;
    this.approvedBy = props.approvedBy ?? null;
    this.cancelledAt = props.cancelledAt ?? null;
    this.cancelledBy = props.cancelledBy ?? null;
    this.cancellationReason = props.cancellationReason ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.resident = props.resident;
    this.house = props.house;
    this.amenity = props.amenity;
  }
}
