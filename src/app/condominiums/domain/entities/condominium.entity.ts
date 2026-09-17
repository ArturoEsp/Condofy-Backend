export class CondominiumEntity {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  googleMapsUrl?: string | null;
  address?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
