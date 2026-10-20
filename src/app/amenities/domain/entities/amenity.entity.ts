import { AmenityReservationType } from '@/core/infrastructure/persistence/prisma/generated/client';

export interface AmenityProps {
  id: string;
  condominiumId: string;
  name: string;
  description?: string | null;
  capacity?: number | null;
  isActive: boolean;
  cost: number;
  requiresDeposit: boolean;
  depositAmount?: number | null;
  rulesDocumentUrl?: string | null;
  rulesDocumentName?: string | null;
  rulesText?: string | null;
  photos: string[];
  reservationType: AmenityReservationType;
  openingTime?: string | null;
  closingTime?: string | null;
  availableDays: number[];
  minNoticeHours: number;
  maxNoticeDays: number;
  maxHoursPerReservation?: number | null;
  requiresApproval: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalReservations?: number;
}

export class AmenityEntity {
  readonly id: string;
  readonly condominiumId: string;
  readonly name: string;
  readonly description: string | null;
  readonly capacity: number | null;
  readonly isActive: boolean;
  readonly cost: number;
  readonly requiresDeposit: boolean;
  readonly depositAmount: number | null;
  readonly rulesDocumentUrl: string | null;
  readonly rulesDocumentName: string | null;
  readonly rulesText: string | null;
  readonly photos: string[];
  readonly reservationType: AmenityReservationType;
  readonly openingTime: string | null;
  readonly closingTime: string | null;
  readonly availableDays: number[];
  readonly minNoticeHours: number;
  readonly maxNoticeDays: number;
  readonly maxHoursPerReservation: number | null;
  readonly requiresApproval: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly totalReservations: number;

  constructor(props: AmenityProps) {
    this.id = props.id;
    this.condominiumId = props.condominiumId;
    this.name = props.name;
    this.description = props.description ?? null;
    this.capacity = props.capacity ?? null;
    this.isActive = props.isActive;
    this.cost = props.cost;
    this.requiresDeposit = props.requiresDeposit;
    this.depositAmount = props.depositAmount ?? null;
    this.rulesDocumentUrl = props.rulesDocumentUrl ?? null;
    this.rulesDocumentName = props.rulesDocumentName ?? null;
    this.rulesText = props.rulesText ?? null;
    this.photos = props.photos ?? [];
    this.reservationType = props.reservationType;
    this.openingTime = props.openingTime ?? null;
    this.closingTime = props.closingTime ?? null;
    this.availableDays = props.availableDays ?? [0, 1, 2, 3, 4, 5, 6];
    this.minNoticeHours = props.minNoticeHours;
    this.maxNoticeDays = props.maxNoticeDays;
    this.maxHoursPerReservation = props.maxHoursPerReservation ?? null;
    this.requiresApproval = props.requiresApproval;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.totalReservations = props.totalReservations ?? 0;
  }
}
