export class StandContactEntity {
  id: string;
  condominiumId: string;
  name: string;
  phoneNumber: string;
  extension: string | null;
  schedule: string | null;
  hasWhatsapp: boolean;
  isPrimary: boolean;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
