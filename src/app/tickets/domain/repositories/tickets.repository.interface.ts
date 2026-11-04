import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TicketScope,
  TicketEntity,
  TicketCommentEntity,
  TicketHistoryEntity,
} from '../entities/ticket.entity';

export interface CreateTicketAttachmentData {
  fileUrl: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
}

export interface CreateTicketData {
  condominiumId: string;
  creatorId: string;
  houseId?: string;
  folio: number;
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  scope?: TicketScope;
  locationDetail?: string;
  attachments?: CreateTicketAttachmentData[];
}

export interface ListTicketsFilters {
  condominiumId: string;
  creatorId?: string;
  houseId?: string;
  assignedAdminId?: string;
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  scope?: TicketScope;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UpdateTicketData {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedAdminId?: string | null;
  providerId?: string | null;
  expenseId?: string | null;
  satisfactionRating?: number;
  satisfactionComment?: string;
  resolvedAt?: Date | null;
  closedAt?: Date | null;
}

export interface CreateCommentData {
  ticketId: string;
  authorId: string;
  content: string;
  isInternal?: boolean;
  attachments?: any;
}

export interface CreateHistoryData {
  ticketId: string;
  changedById: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  note?: string;
}

export interface TicketMetrics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  averageRating: number | null;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface ITicketsRepository {
  create(data: CreateTicketData): Promise<TicketEntity>;
  findById(id: string, condominiumId: string): Promise<TicketEntity | null>;
  findByFolio(folio: number, condominiumId: string): Promise<TicketEntity | null>;
  findMany(filters: ListTicketsFilters): Promise<{ tickets: TicketEntity[]; total: number }>;
  update(id: string, condominiumId: string, data: UpdateTicketData): Promise<TicketEntity>;
  addComment(data: CreateCommentData): Promise<TicketCommentEntity>;
  addHistory(data: CreateHistoryData): Promise<TicketHistoryEntity>;
  getNextFolio(condominiumId: string): Promise<number>;
  getMetrics(condominiumId: string): Promise<TicketMetrics>;
  getUserCondominiumHouseId(userId: string, condominiumId: string): Promise<string | null>;
  getCondominiumAdminUserIds(condominiumId: string): Promise<string[]>;
}

