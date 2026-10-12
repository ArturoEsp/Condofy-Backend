export class CondominiumEntity {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  googleMapsUrl?: string | null;
  address?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  planId?: string | null;
  isTrial?: boolean;
  customPriceOverride?: any;
  isDisabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
