import {
  ServiceProviderCategory,
  ServiceProviderType,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export interface ServiceProviderProps {
  id: string;
  condominiumId: string;
  name: string;
  description?: string | null;
  category: ServiceProviderCategory;
  type: ServiceProviderType;
  imageUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  schedule?: string | null;
  address?: string | null;
  isActive: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount?: number;
  hasLiked?: boolean;
}

export class ServiceProviderEntity {
  readonly id: string;
  readonly condominiumId: string;
  readonly name: string;
  readonly description: string | null;
  readonly category: ServiceProviderCategory;
  readonly type: ServiceProviderType;
  readonly imageUrl: string | null;
  readonly phone: string | null;
  readonly whatsapp: string | null;
  readonly email: string | null;
  readonly website: string | null;
  readonly schedule: string | null;
  readonly address: string | null;
  readonly isActive: boolean;
  readonly createdById: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly likesCount: number;
  readonly hasLiked?: boolean;

  constructor(props: ServiceProviderProps) {
    this.id = props.id;
    this.condominiumId = props.condominiumId;
    this.name = props.name;
    this.description = props.description ?? null;
    this.category = props.category;
    this.type = props.type;
    this.imageUrl = props.imageUrl ?? null;
    this.phone = props.phone ?? null;
    this.whatsapp = props.whatsapp ?? null;
    this.email = props.email ?? null;
    this.website = props.website ?? null;
    this.schedule = props.schedule ?? null;
    this.address = props.address ?? null;
    this.isActive = props.isActive;
    this.createdById = props.createdById;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.likesCount = props.likesCount ?? 0;
    this.hasLiked = props.hasLiked;
  }
}

