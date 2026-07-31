import {
  ResidentProfile,
  User,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { ResidentEntity } from '../../domain/entities/resident.entity';

type ResidentType = ResidentProfile & { user: User };

export class ResidentEntityMapper {
  static toDomain(model: ResidentType): ResidentEntity {
    return {
      id: model.id,
      email: model.user.email,
      role: model.user.role,
      status: model.user.status,
      condominiumId: model.condominiumId,
      houseId: model.houseId,
      residentType: model.residentType,
      firstName: model.firstName,
      lastName: model.lastName,
      phone: model.phone,
      comments: model.comments,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
