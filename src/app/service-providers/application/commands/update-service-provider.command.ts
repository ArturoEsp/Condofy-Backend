import {
  ServiceProviderCategory,
  ServiceProviderType,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export interface UpdateServiceProviderCommand {
  id: string;
  condominiumId: string;
  name?: string;
  description?: string | null;
  category?: ServiceProviderCategory;
  type?: ServiceProviderType;
  imageUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  schedule?: string | null;
  address?: string | null;
  isActive?: boolean;
}
