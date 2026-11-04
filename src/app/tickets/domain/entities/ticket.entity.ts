import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TicketScope,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export { TicketCategory, TicketPriority, TicketStatus, TicketScope };

export interface TicketAttachmentEntity {
  id: string;
  ticketId: string;
  fileUrl: string;
  fileName?: string | null;
  fileSize?: string | null;
  mimeType?: string | null;
  createdAt: Date;
}

export interface TicketCommentEntity {
  id: string;
  ticketId: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  content: string;
  isInternal: boolean;
  attachments?: any;
  createdAt: Date;
}

export interface TicketHistoryEntity {
  id: string;
  ticketId: string;
  changedById: string;
  changedByName?: string;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
  note?: string | null;
  createdAt: Date;
}

export interface TicketEntity {
  id: string;
  condominiumId: string;
  creatorId: string;
  creatorName?: string;
  creatorPhone?: string | null;
  creatorEmail?: string;
  houseId?: string | null;
  houseNumber?: string | null;
  assignedAdminId?: string | null;
  assignedAdminName?: string | null;
  providerId?: string | null;
  providerName?: string | null;
  folio: number;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  scope: TicketScope;
  locationDetail?: string | null;
  expenseId?: string | null;
  satisfactionRating?: number | null;
  satisfactionComment?: string | null;
  attachments?: TicketAttachmentEntity[];
  comments?: TicketCommentEntity[];
  history?: TicketHistoryEntity[];
  resolvedAt?: Date | null;
  closedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

