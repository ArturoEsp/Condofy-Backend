import {
  GeneralProviderCategory,
  GeneralProviderStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export { GeneralProviderCategory, GeneralProviderStatus };

export interface GeneralProviderGuardSummary {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface GeneralProviderAccessEntity {
  id: string;
  condominiumId: string;
  name: string;
  category: GeneralProviderCategory;
  driverName?: string | null;
  vehiclePlate?: string | null;
  companyPhone?: string | null;
  notes?: string | null;
  status: GeneralProviderStatus;
  enteredAt: Date;
  entryGuardId: string;
  entryGuard?: GeneralProviderGuardSummary;
  exitedAt?: Date | null;
  exitGuardId?: string | null;
  exitGuard?: GeneralProviderGuardSummary | null;
  exitNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
