import {
  ServiceProvider as PrismaServiceProvider,
  ServiceProviderLike as PrismaServiceProviderLike,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { ServiceProviderEntity } from '../../domain/entities/service-provider.entity';

export type PrismaServiceProviderWithRelations = PrismaServiceProvider & {
  _count?: {
    likes?: number;
  };
  likes?: PrismaServiceProviderLike[];
  likesCount?: number;
  hasLiked?: boolean;
};

export class ServiceProviderMapper {
  static toDomain(
    raw: PrismaServiceProviderWithRelations,
    currentUserId?: string,
  ): ServiceProviderEntity {
    const likesCount = raw.likesCount ?? raw._count?.likes ?? 0;
    const hasLiked =
      raw.hasLiked !== undefined
        ? raw.hasLiked
        : currentUserId && Array.isArray(raw.likes)
          ? raw.likes.some((l) => l.userId === currentUserId)
          : false;

    return new ServiceProviderEntity({
      id: raw.id,
      condominiumId: raw.condominiumId,
      name: raw.name,
      description: raw.description,
      category: raw.category,
      type: raw.type,
      imageUrl: raw.imageUrl,
      phone: raw.phone,
      whatsapp: raw.whatsapp,
      email: raw.email,
      website: raw.website,
      schedule: raw.schedule,
      address: raw.address,
      isActive: raw.isActive,
      createdById: raw.createdById,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      likesCount,
      hasLiked,
    });
  }
}
