import {
  House,
  ResidentProfile,
  User,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { ResidentEntity } from '../../domain/entities/resident.entity';

type ResidentType = ResidentProfile & { user: User; house?: House };

export class ResidentEntityMapper {
  static toDomain(model: ResidentType): ResidentEntity {
    return {
      id: model.id,
      userId: model.userId,
      email: model.user.email,
      role: model.user.role,
      status: model.user.status,
      condominiumId: model.condominiumId,
      houseId: model.houseId,
      houseNumber: model.house?.houseNumber,
      residentType: model.residentType,
      canCreateVisits: model.canCreateVisits,
      firstName: model.firstName,
      lastName: model.lastName,
      phone: model.phone,
      comments: model.comments,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
