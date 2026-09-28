import { StandContact as PrismaStandContact } from '@/core/infrastructure/persistence/prisma/generated/client';
import { StandContactEntity } from '../../domain/entities/stand-contact.entity';

export class StandContactMapper {
  static toDomain(raw: PrismaStandContact): StandContactEntity {
    const entity = new StandContactEntity();
    entity.id = raw.id;
    entity.condominiumId = raw.condominiumId;
    entity.name = raw.name;
    entity.phoneNumber = raw.phoneNumber;
    entity.extension = raw.extension;
    entity.schedule = raw.schedule;
    entity.hasWhatsapp = raw.hasWhatsapp;
    entity.isPrimary = raw.isPrimary;
    entity.notes = raw.notes;
    entity.isActive = raw.isActive;
    entity.createdAt = raw.createdAt;
    entity.updatedAt = raw.updatedAt;
    return entity;
  }
}
