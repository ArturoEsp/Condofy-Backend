import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import {
  CreateStandContactData,
  StandContactsRepository,
  UpdateStandContactData,
} from '../../domain/repositories/stand-contacts.repository';
import { StandContactEntity } from '../../domain/entities/stand-contact.entity';
import { StandContactMapper } from '../mappers/stand-contact.mapper';

@Injectable()
export class StandContactsPrismaRepository implements StandContactsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateStandContactData): Promise<StandContactEntity> {
    const created = await this.prismaService.standContact.create({
      data: {
        condominiumId: data.condominiumId,
        name: data.name,
        phoneNumber: data.phoneNumber,
        extension: data.extension ?? null,
        schedule: data.schedule ?? '24/7',
        hasWhatsapp: data.hasWhatsapp ?? true,
        isPrimary: data.isPrimary ?? false,
        notes: data.notes ?? null,
        isActive: data.isActive ?? true,
      },
    });

    return StandContactMapper.toDomain(created);
  }

  async findById(id: string): Promise<StandContactEntity | null> {
    const found = await this.prismaService.standContact.findUnique({
      where: { id },
    });
    return found ? StandContactMapper.toDomain(found) : null;
  }

  async findManyByCondominium(
    condominiumId: string,
    onlyActive?: boolean,
  ): Promise<StandContactEntity[]> {
    const where: { condominiumId: string; isActive?: boolean } = {
      condominiumId,
    };
    if (onlyActive) {
      where.isActive = true;
    }

    const contacts = await this.prismaService.standContact.findMany({
      where,
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });

    return contacts.map(StandContactMapper.toDomain);
  }

  async update(
    id: string,
    data: UpdateStandContactData,
  ): Promise<StandContactEntity> {
    const updated = await this.prismaService.standContact.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phoneNumber !== undefined && {
          phoneNumber: data.phoneNumber,
        }),
        ...(data.extension !== undefined && { extension: data.extension }),
        ...(data.schedule !== undefined && { schedule: data.schedule }),
        ...(data.hasWhatsapp !== undefined && {
          hasWhatsapp: data.hasWhatsapp,
        }),
        ...(data.isPrimary !== undefined && { isPrimary: data.isPrimary }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return StandContactMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.standContact.delete({
      where: { id },
    });
  }

  async unsetPrimary(condominiumId: string, excludeId?: string): Promise<void> {
    await this.prismaService.standContact.updateMany({
      where: {
        condominiumId,
        isPrimary: true,
        ...(excludeId && { id: { not: excludeId } }),
      },
      data: {
        isPrimary: false,
      },
    });
  }

  async countByCondominium(condominiumId: string): Promise<number> {
    return await this.prismaService.standContact.count({
      where: { condominiumId },
    });
  }
}
