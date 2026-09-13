import { Visitor } from '@/core/infrastructure/persistence/prisma/generated/client';
import { VisitorEntity } from '../../domain/entities/visitor.entity';

export class VisitorEntityMapper {
  static toDomain(model: Visitor): VisitorEntity {
    return {
      id: model.id,
      houseId: model.houseId,
      firstName: model.firstName,
      lastName: model.lastName,
      phone: model.phone,
      email: model.email,
      photo: model.photo,
      category: model.category,
      vehiclePlate: model.vehiclePlate,
      notes: model.notes,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
