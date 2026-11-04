import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { StorageService } from '@/core/domain/services/storage.service';
import {
  ITicketsRepository,
  CreateTicketData,
  ListTicketsFilters,
  UpdateTicketData,
  CreateCommentData,
  CreateHistoryData,
  TicketMetrics,
} from '../../domain/repositories/tickets.repository.interface';
import {
  TicketEntity,
  TicketCommentEntity,
  TicketHistoryEntity,
  TicketStatus,
} from '../../domain/entities/ticket.entity';
import { TicketMapper } from '../mappers/ticket.mapper';
import { Prisma } from '@/core/infrastructure/persistence/prisma/generated/client';

@Injectable()
export class TicketsPrismaRepository implements ITicketsRepository {
  private readonly defaultTicketInclude = {
    creator: {
      include: { residentProfile: true },
    },
    house: true,
    assignedAdmin: {
      include: { residentProfile: true },
    },
    provider: true,
    attachments: true,
    comments: {
      include: {
        author: {
          include: { residentProfile: true },
        },
      },
      orderBy: { createdAt: 'asc' as const },
    },
    history: {
      include: {
        changedBy: {
          include: { residentProfile: true },
        },
      },
      orderBy: { createdAt: 'desc' as const },
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PROVIDES_NAMES.StorageService)
    private readonly storageService: StorageService,
  ) {}

  private extractStorageKey(urlOrKey: string): string {
    if (!urlOrKey) return '';
    const trimmed = urlOrKey.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const parsed = new URL(trimmed);
        let cleanPath = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
        if (cleanPath.startsWith('condofy-private/')) {
          cleanPath = cleanPath.replace(/^condofy-private\//, '');
        }
        return cleanPath;
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  private async resolveAttachmentUrl(rawUrlOrKey: string): Promise<string> {
    if (!rawUrlOrKey) return '';
    const key = this.extractStorageKey(rawUrlOrKey);
    if (key.startsWith('condominiums/')) {
      try {
        return await this.storageService.getPresignedUrl(key, 604800);
      } catch {
        return rawUrlOrKey;
      }
    }
    return rawUrlOrKey;
  }

  private async mapTicketToDomain(raw: any): Promise<TicketEntity> {
    const domain = TicketMapper.toDomain(raw);
    if (domain.attachments && domain.attachments.length > 0) {
      domain.attachments = await Promise.all(
        domain.attachments.map(async (att) => ({
          ...att,
          fileUrl: await this.resolveAttachmentUrl(att.fileUrl),
        })),
      );
    }
    return domain;
  }

  async getNextFolio(condominiumId: string): Promise<number> {
    const lastTicket = await this.prisma.ticket.findFirst({
      where: { condominiumId },
      orderBy: { folio: 'desc' },
      select: { folio: true },
    });
    return (lastTicket?.folio ?? 0) + 1;
  }

  async getUserCondominiumHouseId(userId: string, condominiumId: string): Promise<string | null> {
    const profile = await this.prisma.residentProfile.findFirst({
      where: { userId, condominiumId },
      select: { houseId: true },
    });
    return profile?.houseId ?? null;
  }

  async getCondominiumAdminUserIds(condominiumId: string): Promise<string[]> {
    const admins = await this.prisma.user.findMany({
      where: {
        condominiumId,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      select: { id: true },
    });
    return admins.map((a) => a.id);
  }

  async create(data: CreateTicketData): Promise<TicketEntity> {
    const ticket = await this.prisma.ticket.create({
      data: {
        condominiumId: data.condominiumId,
        creatorId: data.creatorId,
        houseId: data.houseId,
        folio: data.folio,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority ?? 'MEDIUM',
        scope: data.scope ?? 'COMMON_AREA',
        locationDetail: data.locationDetail,
        attachments: data.attachments && data.attachments.length > 0
          ? {
              create: data.attachments.map((att) => ({
                fileUrl: att.fileUrl,
                fileName: att.fileName,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
              })),
            }
          : undefined,
      },
      include: this.defaultTicketInclude,
    });

    return this.mapTicketToDomain(ticket);
  }

  async findById(id: string, condominiumId: string): Promise<TicketEntity | null> {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, condominiumId },
      include: this.defaultTicketInclude,
    });

    if (!ticket) return null;
    return this.mapTicketToDomain(ticket);
  }

  async findByFolio(folio: number, condominiumId: string): Promise<TicketEntity | null> {
    const ticket = await this.prisma.ticket.findFirst({
      where: { folio, condominiumId },
      include: this.defaultTicketInclude,
    });

    if (!ticket) return null;
    return this.mapTicketToDomain(ticket);
  }

  async findMany(filters: ListTicketsFilters): Promise<{ tickets: TicketEntity[]; total: number }> {
    const where: Prisma.TicketWhereInput = {
      condominiumId: filters.condominiumId,
    };

    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }

    if (filters.houseId) {
      where.houseId = filters.houseId;
    }

    if (filters.assignedAdminId) {
      where.assignedAdminId = filters.assignedAdminId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.scope) {
      where.scope = filters.scope;
    }

    if (filters.search && filters.search.trim().length > 0) {
      const query = filters.search.trim();
      const maybeFolio = parseInt(query.replace('#', ''), 10);
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { locationDetail: { contains: query, mode: 'insensitive' } },
        ...(Number.isInteger(maybeFolio) ? [{ folio: maybeFolio }] : []),
      ];
    }

    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.max(1, Math.min(100, filters.limit ?? 20));
    const skip = (page - 1) * limit;

    const [total, rawTickets] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.defaultTicketInclude,
      }),
    ]);

    const tickets = await Promise.all(
      rawTickets.map((t) => this.mapTicketToDomain(t)),
    );

    return { tickets, total };
  }

  async update(id: string, condominiumId: string, data: UpdateTicketData): Promise<TicketEntity> {
    const existing = await this.prisma.ticket.findFirst({
      where: { id, condominiumId },
    });

    if (!existing) {
      throw new NotFoundException(`Ticket con id ${id} no encontrado`);
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        status: data.status,
        priority: data.priority,
        assignedAdminId: data.assignedAdminId,
        providerId: data.providerId,
        expenseId: data.expenseId,
        satisfactionRating: data.satisfactionRating,
        satisfactionComment: data.satisfactionComment,
        resolvedAt: data.resolvedAt,
        closedAt: data.closedAt,
      },
      include: this.defaultTicketInclude,
    });

    return this.mapTicketToDomain(updated);
  }

  async addComment(data: CreateCommentData): Promise<TicketCommentEntity> {
    const comment = await this.prisma.ticketComment.create({
      data: {
        ticketId: data.ticketId,
        authorId: data.authorId,
        content: data.content,
        isInternal: data.isInternal ?? false,
        attachments: data.attachments,
      },
      include: {
        author: {
          include: { residentProfile: true },
        },
      },
    });

    const authorName = comment.author?.residentProfile
      ? `${comment.author.residentProfile.firstName || ''} ${comment.author.residentProfile.lastName || ''}`.trim()
      : `${comment.author?.firstName || ''} ${comment.author?.lastName || ''}`.trim() || comment.author?.email;

    return {
      id: comment.id,
      ticketId: comment.ticketId,
      authorId: comment.authorId,
      authorName: authorName || undefined,
      authorRole: comment.author?.role,
      content: comment.content,
      isInternal: comment.isInternal,
      attachments: comment.attachments,
      createdAt: comment.createdAt,
    };
  }

  async addHistory(data: CreateHistoryData): Promise<TicketHistoryEntity> {
    const history = await this.prisma.ticketHistory.create({
      data: {
        ticketId: data.ticketId,
        changedById: data.changedById,
        action: data.action,
        oldValue: data.oldValue,
        newValue: data.newValue,
        note: data.note,
      },
      include: {
        changedBy: {
          include: { residentProfile: true },
        },
      },
    });

    const changedByName = history.changedBy?.residentProfile
      ? `${history.changedBy.residentProfile.firstName || ''} ${history.changedBy.residentProfile.lastName || ''}`.trim()
      : `${history.changedBy?.firstName || ''} ${history.changedBy?.lastName || ''}`.trim() || history.changedBy?.email;

    return {
      id: history.id,
      ticketId: history.ticketId,
      changedById: history.changedById,
      changedByName: changedByName || undefined,
      action: history.action,
      oldValue: history.oldValue,
      newValue: history.newValue,
      note: history.note,
      createdAt: history.createdAt,
    };
  }

  async getMetrics(condominiumId: string): Promise<TicketMetrics> {
    const tickets = await this.prisma.ticket.findMany({
      where: { condominiumId },
      select: {
        status: true,
        category: true,
        priority: true,
        satisfactionRating: true,
      },
    });

    let open = 0;
    let inProgress = 0;
    let resolved = 0;
    let closed = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const t of tickets) {
      if (t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_REVIEW) {
        open++;
      } else if (
        t.status === TicketStatus.IN_PROGRESS ||
        t.status === TicketStatus.WAITING_THIRD_PARTY
      ) {
        inProgress++;
      } else if (t.status === TicketStatus.RESOLVED) {
        resolved++;
      } else if (t.status === TicketStatus.CLOSED) {
        closed++;
      }

      if (t.satisfactionRating) {
        ratingSum += t.satisfactionRating;
        ratingCount++;
      }

      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    }

    return {
      total: tickets.length,
      open,
      inProgress,
      resolved,
      closed,
      averageRating: ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(1)) : null,
      byCategory,
      byPriority,
    };
  }
}

