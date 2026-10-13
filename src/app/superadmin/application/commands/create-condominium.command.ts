export class SuperadminCreateCondominiumCommand {
  key: string;
  name: string;
  description?: string;
  googleMapsUrl?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  planId?: string;
  isTrial?: boolean;
  customPriceOverride?: number;
}
