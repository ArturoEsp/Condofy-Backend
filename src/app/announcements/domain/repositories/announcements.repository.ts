import {
  AnnouncementEntity,
  AnnouncementAttachmentEntity,
  AnnouncementCategory,
  AnnouncementPriority,
} from '../entities/announcement.entity';

export interface CreateAnnouncementAttachmentData {
  type: 'IMAGE' | 'DOCUMENT';
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  mimeType?: string;
  order?: number;
}

export interface CreateAnnouncementData {
  condominiumId: string;
  createdById: string;
  authorName: string;
  title: string;
  previewMessage: string;
  content: string;
  category?: AnnouncementCategory;
  priority?: AnnouncementPriority;
  startDate?: Date;
  endDate?: Date | null;
  isActive?: boolean;
  attachments?: CreateAnnouncementAttachmentData[];
}

export interface UpdateAnnouncementData {
  title?: string;
  previewMessage?: string;
  content?: string;
  category?: AnnouncementCategory;
  priority?: AnnouncementPriority;
  startDate?: Date;
  endDate?: Date | null;
  isActive?: boolean;
  keepAttachmentIds?: string[];
  newAttachments?: CreateAnnouncementAttachmentData[];
}

export interface FindAnnouncementsFilter {
  condominiumId: string;
  status?: string; // 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DRAFT' | 'ALL'
  category?: AnnouncementCategory;
  priority?: AnnouncementPriority;
  search?: string;
  activeOnly?: boolean; // Used for resident dashboard
}

export interface RecordReaderData {
  announcementId: string;
  userId: string;
  houseId?: string | null;
}

export interface AnnouncementsRepository {
  create(data: CreateAnnouncementData): Promise<AnnouncementEntity>;
  findById(
    id: string,
    condominiumId: string,
  ): Promise<AnnouncementEntity | null>;
  findAll(filter: FindAnnouncementsFilter): Promise<AnnouncementEntity[]>;
  update(
    id: string,
    condominiumId: string,
    data: UpdateAnnouncementData,
  ): Promise<AnnouncementEntity>;
  toggleActive(id: string, condominiumId: string): Promise<AnnouncementEntity>;
  delete(id: string, condominiumId: string): Promise<void>;
  recordReader(data: RecordReaderData): Promise<{ wasRecorded: boolean }>;
}
