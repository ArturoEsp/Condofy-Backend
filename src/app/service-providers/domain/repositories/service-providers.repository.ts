import {
  ServiceProviderCategory,
  ServiceProviderType,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { ServiceProviderEntity } from '../entities/service-provider.entity';

export interface CreateServiceProviderData {
  condominiumId: string;
  name: string;
  description?: string | null;
  category: ServiceProviderCategory;
  type?: ServiceProviderType;
  imageUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  schedule?: string | null;
  address?: string | null;
  isActive?: boolean;
  createdById: string;
}

export interface UpdateServiceProviderData {
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

export interface FindAllServiceProvidersParams {
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

export interface ServiceProvidersRepository {
  create(data: CreateServiceProviderData): Promise<ServiceProviderEntity>;
  findById(
    id: string,
    condominiumId: string,
    currentUserId?: string,
  ): Promise<ServiceProviderEntity | null>;
  findAll(
    params: FindAllServiceProvidersParams,
  ): Promise<{ providers: ServiceProviderEntity[]; total: number; page: number; limit: number }>;
  update(
    id: string,
    condominiumId: string,
    data: UpdateServiceProviderData,
  ): Promise<ServiceProviderEntity>;
  delete(id: string, condominiumId: string): Promise<void>;
  toggleLike(
    providerId: string,
    userId: string,
  ): Promise<{ hasLiked: boolean; likesCount: number }>;
}

