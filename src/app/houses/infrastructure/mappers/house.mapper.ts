import {
  House,
  ResidentProfile,
  User,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { HouseEntity } from '../../domain/entities/house.entity';

type ResidentType = ResidentProfile & { user: User };

type HouseType = House & { residents: ResidentType[] };

export class HouseEntityMapper {
  static toDomain(model: HouseType): HouseEntity {
    return {
      id: model.id,
      condominiumId: model.condominiumId,
      houseNumber: model.houseNumber,
      tower: model.tower,
      residents: model.residents.map((resident) => ({
        id: resident.id,
        firstName: resident.firstName,
        lastName: resident.lastName,
        comments: resident.comments,
        phone: resident.phone,
        email: resident.user.email,
        createdAt: resident.createdAt.toISOString(),
        updatedAt: resident.updatedAt.toISOString(),
        isEmailVerified: resident.user.isEmailVerified,
        residentType: resident.residentType,
        status: resident.user.status,
        role: resident.user.role,
      })),
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
