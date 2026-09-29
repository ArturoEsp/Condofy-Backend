import {
  AnnouncementEntity,
  AnnouncementAttachmentEntity,
  AnnouncementReaderEntity,
} from '../../domain/entities/announcement.entity';

export class AnnouncementMapper {
  static toDomain(raw: any): AnnouncementEntity {
    return {
      id: raw.id,
      condominiumId: raw.condominiumId,
      title: raw.title,
      previewMessage: raw.previewMessage,
      content: raw.content,
      category: raw.category,
      priority: raw.priority,
      startDate: raw.startDate,
      endDate: raw.endDate ?? null,
      isActive: raw.isActive,
      authorName: raw.authorName,
      createdById: raw.createdById,
      viewsCount: raw.viewsCount,
      attachments: raw.attachments?.map((att: any) =>
        AnnouncementMapper.toAttachmentDomain(att),
      ),
      readers: raw.readers?.map((r: any) =>
        AnnouncementMapper.toReaderDomain(r),
      ),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toAttachmentDomain(raw: any): AnnouncementAttachmentEntity {
    return {
      id: raw.id,
      announcementId: raw.announcementId,
      type: raw.type,
      fileUrl: raw.fileUrl,
      fileName: raw.fileName,
      fileSize: raw.fileSize ?? null,
      mimeType: raw.mimeType ?? null,
      order: raw.order,
      createdAt: raw.createdAt,
    };
  }

  static toReaderDomain(raw: any): AnnouncementReaderEntity {
    const residentName = raw.user
      ? `${raw.user.firstName || ''} ${raw.user.lastName || ''}`.trim() ||
        raw.user.email
      : undefined;

    return {
      id: raw.id,
      announcementId: raw.announcementId,
      userId: raw.userId,
      residentName,
      houseId: raw.houseId ?? null,
      houseNumber: raw.house?.houseNumber ?? null,
      readAt: raw.readAt,
    };
  }
}
