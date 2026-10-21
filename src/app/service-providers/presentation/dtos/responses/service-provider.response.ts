import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  ServiceProviderCategory,
  ServiceProviderType,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { ServiceProviderEntity } from '@/app/service-providers/domain/entities/service-provider.entity';

export class ServiceProviderResponse {
  @ApiProperty({ example: 'd3b07384-d113-4f4c-9f6b-0b5c15e8f4a1' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'd3b07384-d113-4f4c-9f6b-0b5c15e8f4a2' })
  @Expose()
  condominiumId: string;

  @ApiProperty({ example: 'Cerrajería y Seguridad Express' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ example: 'Apertura y duplicado de llaves a domicilio' })
  @Expose()
  description?: string | null;

  @ApiProperty({
    enum: ServiceProviderCategory,
    example: ServiceProviderCategory.LOCKSMITH,
  })
  @Expose()
  category: ServiceProviderCategory;

  @ApiProperty({
    enum: ServiceProviderType,
    example: ServiceProviderType.COMMUNITY,
  })
  @Expose()
  type: ServiceProviderType;

  @ApiPropertyOptional({ example: 'https://storage.condofy.com.mx/providers/cerrajeria.jpg' })
  @Expose()
  imageUrl?: string | null;

  @ApiPropertyOptional({ example: '+52 55 1234 5678' })
  @Expose()
  phone?: string | null;

  @ApiPropertyOptional({ example: '525512345678' })
  @Expose()
  whatsapp?: string | null;

  @ApiPropertyOptional({ example: 'contacto@cerrajeriaexpress.com' })
  @Expose()
  email?: string | null;

  @ApiPropertyOptional({ example: 'https://cerrajeriaexpress.com' })
  @Expose()
  website?: string | null;

  @ApiPropertyOptional({ example: 'Lunes a Sábado 8:00 - 20:00' })
  @Expose()
  schedule?: string | null;

  @ApiPropertyOptional({ example: 'Av. Principal #123' })
  @Expose()
  address?: string | null;

  @ApiProperty({ example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty({ example: 'd3b07384-d113-4f4c-9f6b-0b5c15e8f4a3' })
  @Expose()
  createdById: string;

  @ApiProperty({ example: 12, description: 'Total de recomendaciones/likes recibidos' })
  @Expose()
  likesCount: number;

  @ApiPropertyOptional({ example: true, description: 'Indica si el usuario actual ha recomendado a este proveedor' })
  @Expose()
  hasLiked?: boolean;

  @ApiProperty({ example: '2026-10-21T08:30:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-10-21T08:30:00.000Z' })
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: ServiceProviderEntity): ServiceProviderResponse {
    const res = new ServiceProviderResponse();
    res.id = entity.id;
    res.condominiumId = entity.condominiumId;
    res.name = entity.name;
    res.description = entity.description;
    res.category = entity.category;
    res.type = entity.type;
    res.imageUrl = entity.imageUrl;
    res.phone = entity.phone;
    res.whatsapp = entity.whatsapp;
    res.email = entity.email;
    res.website = entity.website;
    res.schedule = entity.schedule;
    res.address = entity.address;
    res.isActive = entity.isActive;
    res.createdById = entity.createdById;
    res.likesCount = entity.likesCount;
    res.hasLiked = entity.hasLiked;
    res.createdAt = entity.createdAt;
    res.updatedAt = entity.updatedAt;
    return res;
  }
}

