export class SuperadminUpdateCondominiumCommand {
  id: string;
  name?: string;
  description?: string;
  googleMapsUrl?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  planId?: string | null;
  isTrial?: boolean;
  customPriceOverride?: number | null;
  isDisabled?: boolean;
}
