import {
  AnnouncementPriority,
  AnnouncementCategory,
  AnnouncementAttachmentType,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export {
  AnnouncementPriority,
  AnnouncementCategory,
  AnnouncementAttachmentType,
};

export interface AnnouncementAttachmentEntity {
  id: string;
  announcementId: string;
  type: AnnouncementAttachmentType;
  fileUrl: string;
  fileName: string;
  fileSize?: string | null;
  mimeType?: string | null;
  order: number;
  createdAt: Date;
}

export interface AnnouncementReaderEntity {
  id: string;
  announcementId: string;
  userId: string;
  residentName?: string;
  houseId?: string | null;
  houseNumber?: string | null;
  readAt: Date;
}

export interface AnnouncementEntity {
  id: string;
  condominiumId: string;
  title: string;
  previewMessage: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  startDate: Date;
  endDate?: Date | null;
  isActive: boolean;
  authorName: string;
  createdById: string;
  viewsCount: number;
  attachments?: AnnouncementAttachmentEntity[];
  readers?: AnnouncementReaderEntity[];
  createdAt: Date;
  updatedAt: Date;
}
