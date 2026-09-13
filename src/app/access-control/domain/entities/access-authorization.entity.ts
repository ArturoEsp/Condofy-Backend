import {
  AuthorizationStatus,
  AuthorizationType,
} from '@/core/infrastructure/persistence/prisma/generated/enums';
import { VisitorEntity } from './visitor.entity';

export class AccessAuthorizationEntity {
  id: string;
  index: number;
  code: string; // Identificador visual tipo ACC-0001
  visitorId: string;
  visitor?: VisitorEntity;
  qrCode: string;
  pin: string;
  vehiclePlate: string | null;
  type: AuthorizationType;
  status: AuthorizationStatus;
  insideCondo: boolean;
  lastLog?: {
    id: string;
    entryType: string;
    date: Date;
    observations: string | null;
  };
  validFrom: Date;
  validUntil: Date | null;
  maxEntries: number | null;
  usedEntries: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
