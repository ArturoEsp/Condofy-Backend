import {
  ServiceProviderCategory,
  ServiceProviderType,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export interface GetServiceProvidersQuery {
  condominiumId: string;
  category?: ServiceProviderCategory;
  type?: ServiceProviderType;
  isActive?: boolean;
  search?: string;
  onlyLiked?: boolean;
  currentUserId?: string;
  sortBy?: 'likes' | 'recent' | 'name';
  page?: number;
  limit?: number;
}
