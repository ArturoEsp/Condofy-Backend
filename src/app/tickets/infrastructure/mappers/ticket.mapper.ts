import {
  TicketEntity,
  TicketAttachmentEntity,
  TicketCommentEntity,
  TicketHistoryEntity,
} from '../../domain/entities/ticket.entity';

export class TicketMapper {
  private static getUserFullName(user: any): string | undefined {
    if (!user) return undefined;

    // 1. Priorizar perfil de residente si existe
    if (user.residentProfile) {
      const residentName =
        `${user.residentProfile.firstName || ''} ${user.residentProfile.lastName || ''}`.trim();
      if (residentName) return residentName;
    }

    // 2. Revisar nombre directo en el usuario
    const directName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (directName) return directName;

    // 3. Fallback a correo
    return user.email;
  }

  static toDomain(raw: any): TicketEntity {
    return {
      id: raw.id,
      condominiumId: raw.condominiumId,
      creatorId: raw.creatorId,
      creatorName: TicketMapper.getUserFullName(raw.creator),
      creatorPhone:
        raw.creator?.phone ?? raw.creator?.residentProfile?.phone ?? null,
      creatorEmail: raw.creator?.email,
      houseId: raw.houseId ?? null,
      houseNumber: raw.house?.houseNumber ?? null,
      assignedAdminId: raw.assignedAdminId ?? null,
      assignedAdminName: raw.assignedAdmin
        ? (TicketMapper.getUserFullName(raw.assignedAdmin) ?? null)
        : null,
      providerId: raw.providerId ?? null,
      providerName: raw.provider?.name ?? null,
      folio: raw.folio,
      title: raw.title,
      description: raw.description,
      category: raw.category,
      priority: raw.priority,
      status: raw.status,
      scope: raw.scope,
      locationDetail: raw.locationDetail ?? null,
      expenseId: raw.expenseId ?? null,
      satisfactionRating: raw.satisfactionRating ?? null,
      satisfactionComment: raw.satisfactionComment ?? null,
      attachments: raw.attachments
        ? raw.attachments.map(
            (att: any): TicketAttachmentEntity => ({
              id: att.id,
              ticketId: att.ticketId,
              fileUrl: att.fileUrl,
              fileName: att.fileName ?? null,
              fileSize: att.fileSize ?? null,
              mimeType: att.mimeType ?? null,
              createdAt: att.createdAt,
            }),
          )
        : [],
      comments: raw.comments
        ? raw.comments.map(
            (c: any): TicketCommentEntity => ({
              id: c.id,
              ticketId: c.ticketId,
              authorId: c.authorId,
              authorName: TicketMapper.getUserFullName(c.author),
              authorRole: c.author?.role,
              content: c.content,
              isInternal: c.isInternal,
              attachments: c.attachments,
              createdAt: c.createdAt,
            }),
          )
        : [],
      history: raw.history
        ? raw.history.map(
            (h: any): TicketHistoryEntity => ({
              id: h.id,
              ticketId: h.ticketId,
              changedById: h.changedById,
              changedByName: TicketMapper.getUserFullName(h.changedBy),
              action: h.action,
              oldValue: h.oldValue ?? null,
              newValue: h.newValue ?? null,
              note: h.note ?? null,
              createdAt: h.createdAt,
            }),
          )
        : [],
      resolvedAt: raw.resolvedAt ?? null,
      closedAt: raw.closedAt ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
