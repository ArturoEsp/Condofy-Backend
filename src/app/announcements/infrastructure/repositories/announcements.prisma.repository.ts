import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { StorageService } from '@/core/domain/services/storage.service';
import {
  AnnouncementsRepository,
  CreateAnnouncementData,
  FindAnnouncementsFilter,
  RecordReaderData,
  UpdateAnnouncementData,
} from '../../domain/repositories/announcements.repository';
import { AnnouncementEntity } from '../../domain/entities/announcement.entity';
import { AnnouncementMapper } from '../mappers/announcement.mapper';
import {
  AnnouncementCategory,
  AnnouncementPriority,
} from '@/core/infrastructure/persistence/prisma/generated/client';

@Injectable()
export class AnnouncementsPrismaRepository implements AnnouncementsRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PROVIDES_NAMES.StorageService)
    private readonly storageService: StorageService,
  ) {}

  async create(data: CreateAnnouncementData): Promise<AnnouncementEntity> {
    const created = await this.prisma.announcement.create({
      data: {
        condominiumId: data.condominiumId,
        createdById: data.createdById,
        authorName: data.authorName,
        title: data.title.trim(),
        previewMessage: data.previewMessage.trim(),
        content: data.content.trim(),
        category: (data.category as AnnouncementCategory) || 'GENERAL',
        priority: (data.priority as AnnouncementPriority) || 'NORMAL',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        attachments:
          data.attachments && data.attachments.length > 0
            ? {
                create: data.attachments.map((att, idx) => ({
                  type: att.type,
                  fileUrl: att.fileUrl,
                  fileName: att.fileName,
                  fileSize: att.fileSize ?? null,
                  mimeType: att.mimeType ?? null,
                  order: att.order ?? idx,
                })),
              }
            : undefined,
      },
      include: {
        attachments: { orderBy: { order: 'asc' } },
        readers: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            house: { select: { houseNumber: true } },
          },
        },
      },
    });

    return AnnouncementMapper.toDomain(created);
  }

  async findById(
    id: string,
    condominiumId: string,
  ): Promise<AnnouncementEntity | null> {
    const announcement = await this.prisma.announcement.findFirst({
      where: { id, condominiumId },
      include: {
        attachments: { orderBy: { order: 'asc' } },
        readers: {
          orderBy: { readAt: 'desc' },
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            house: { select: { houseNumber: true } },
          },
        },
      },
    });

    if (!announcement) return null;
    return AnnouncementMapper.toDomain(announcement);
  }

  async findAll(
    filter: FindAnnouncementsFilter,
  ): Promise<AnnouncementEntity[]> {
    const now = new Date();
    const where: any = { condominiumId: filter.condominiumId };

    if (filter.activeOnly) {
      where.isActive = true;
      where.startDate = { lte: now };
      where.OR = [{ endDate: null }, { endDate: { gte: now } }];
    } else if (filter.status && filter.status !== 'ALL') {
      switch (filter.status) {
        case 'ACTIVE':
          where.isActive = true;
          where.startDate = { lte: now };
          where.OR = [{ endDate: null }, { endDate: { gte: now } }];
          break;
        case 'SCHEDULED':
          where.isActive = true;
          where.startDate = { gt: now };
          break;
        case 'EXPIRED':
          where.isActive = true;
          where.endDate = { lt: now };
          break;
        case 'DRAFT':
          where.isActive = false;
          break;
      }
    }

    if (filter.category) {
      where.category = filter.category;
    }

    if (filter.priority) {
      where.priority = filter.priority;
    }

    if (filter.search?.trim()) {
      const term = filter.search.trim();
      const searchConditions = [
        { title: { contains: term, mode: 'insensitive' } },
        { previewMessage: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } },
      ];

      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const announcements = await this.prisma.announcement.findMany({
      where,
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
      include: {
        attachments: { orderBy: { order: 'asc' } },
        readers: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            house: { select: { houseNumber: true } },
          },
        },
      },
    });

    return announcements.map((a) => AnnouncementMapper.toDomain(a));
  }

  async update(
    id: string,
    condominiumId: string,
    data: UpdateAnnouncementData,
  ): Promise<AnnouncementEntity> {
    const existing = await this.prisma.announcement.findFirst({
      where: { id, condominiumId },
      include: { attachments: true },
    });

    if (!existing) {
      throw new NotFoundException('El comunicado no fue encontrado');
    }

    // Gestionar attachments eliminados si se especifica lista de conservados
    if (data.keepAttachmentIds !== undefined) {
      const toDelete = existing.attachments.filter(
        (att) => !data.keepAttachmentIds?.includes(att.id),
      );

      if (toDelete.length > 0) {
        for (const att of toDelete) {
          try {
            await this.storageService.deleteFile(att.fileUrl);
          } catch {
            // Continuar incluso si falla el borrado del storage
          }
        }
        await this.prisma.announcementAttachment.deleteMany({
          where: { id: { in: toDelete.map((d) => d.id) } },
        });
      }
    }

    // Agregar nuevos attachments si existen
    if (data.newAttachments && data.newAttachments.length > 0) {
      const currentCount = await this.prisma.announcementAttachment.count({
        where: { announcementId: id },
      });

      await this.prisma.announcementAttachment.createMany({
        data: data.newAttachments.map((att, idx) => ({
          announcementId: id,
          type: att.type,
          fileUrl: att.fileUrl,
          fileName: att.fileName,
          fileSize: att.fileSize ?? null,
          mimeType: att.mimeType ?? null,
          order: currentCount + idx,
        })),
      });
    }

    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.previewMessage !== undefined)
      updatePayload.previewMessage = data.previewMessage.trim();
    if (data.content !== undefined) updatePayload.content = data.content.trim();
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.startDate !== undefined)
      updatePayload.startDate = new Date(data.startDate);
    if (data.endDate !== undefined)
      updatePayload.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    const updated = await this.prisma.announcement.update({
      where: { id },
      data: updatePayload,
      include: {
        attachments: { orderBy: { order: 'asc' } },
        readers: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            house: { select: { houseNumber: true } },
          },
        },
      },
    });

    return AnnouncementMapper.toDomain(updated);
  }

  async toggleActive(
    id: string,
    condominiumId: string,
  ): Promise<AnnouncementEntity> {
    const existing = await this.prisma.announcement.findFirst({
      where: { id, condominiumId },
    });

    if (!existing) {
      throw new NotFoundException('El comunicado no fue encontrado');
    }

    const updated = await this.prisma.announcement.update({
      where: { id },
      data: { isActive: !existing.isActive },
      include: {
        attachments: { orderBy: { order: 'asc' } },
        readers: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            house: { select: { houseNumber: true } },
          },
        },
      },
    });

    return AnnouncementMapper.toDomain(updated);
  }

  async delete(id: string, condominiumId: string): Promise<void> {
    const existing = await this.prisma.announcement.findFirst({
      where: { id, condominiumId },
      include: { attachments: true },
    });

    if (!existing) {
      throw new NotFoundException('El comunicado no fue encontrado');
    }

    // Limpiar archivos en storage
    for (const att of existing.attachments) {
      try {
        await this.storageService.deleteFile(att.fileUrl);
      } catch {
        // Ignorar error si el archivo ya no existe
      }
    }

    await this.prisma.announcement.delete({
      where: { id },
    });
  }

  async recordReader(
    data: RecordReaderData,
  ): Promise<{ wasRecorded: boolean }> {
    const existing = await this.prisma.announcementReader.findUnique({
      where: {
        announcementId_userId: {
          announcementId: data.announcementId,
          userId: data.userId,
        },
      },
    });

    if (existing) {
      return { wasRecorded: false };
    }

    await this.prisma.$transaction([
      this.prisma.announcementReader.create({
        data: {
          announcementId: data.announcementId,
          userId: data.userId,
          houseId: data.houseId ?? null,
        },
      }),
      this.prisma.announcement.update({
        where: { id: data.announcementId },
        data: {
          viewsCount: { increment: 1 },
        },
      }),
    ]);

    return { wasRecorded: true };
  }
}
