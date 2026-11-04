import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TicketScope,
} from '@/core/infrastructure/persistence/prisma/generated/enums';
import {
  TicketEntity,
  TicketAttachmentEntity,
  TicketCommentEntity,
  TicketHistoryEntity,
} from '../../../domain/entities/ticket.entity';

export class TicketAttachmentResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  fileUrl: string;

  @ApiPropertyOptional()
  @Expose()
  fileName?: string | null;

  @ApiPropertyOptional()
  @Expose()
  fileSize?: string | null;

  @ApiPropertyOptional()
  @Expose()
  mimeType?: string | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  static fromEntity(entity: TicketAttachmentEntity): TicketAttachmentResponse {
    const res = new TicketAttachmentResponse();
    res.id = entity.id;
    res.fileUrl = entity.fileUrl;
    res.fileName = entity.fileName;
    res.fileSize = entity.fileSize;
    res.mimeType = entity.mimeType;
    res.createdAt = entity.createdAt;
    return res;
  }
}

export class TicketCommentResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  authorId: string;

  @ApiPropertyOptional()
  @Expose()
  authorName?: string;

  @ApiPropertyOptional()
  @Expose()
  authorRole?: string;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  isInternal: boolean;

  @ApiPropertyOptional()
  @Expose()
  attachments?: any;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  static fromEntity(entity: TicketCommentEntity): TicketCommentResponse {
    const res = new TicketCommentResponse();
    res.id = entity.id;
    res.authorId = entity.authorId;
    res.authorName = entity.authorName;
    res.authorRole = entity.authorRole;
    res.content = entity.content;
    res.isInternal = entity.isInternal;
    res.attachments = entity.attachments;
    res.createdAt = entity.createdAt;
    return res;
  }
}

export class TicketHistoryResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  changedById: string;

  @ApiPropertyOptional()
  @Expose()
  changedByName?: string;

  @ApiProperty()
  @Expose()
  action: string;

  @ApiPropertyOptional()
  @Expose()
  oldValue?: string | null;

  @ApiPropertyOptional()
  @Expose()
  newValue?: string | null;

  @ApiPropertyOptional()
  @Expose()
  note?: string | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  static fromEntity(entity: TicketHistoryEntity): TicketHistoryResponse {
    const res = new TicketHistoryResponse();
    res.id = entity.id;
    res.changedById = entity.changedById;
    res.changedByName = entity.changedByName;
    res.action = entity.action;
    res.oldValue = entity.oldValue;
    res.newValue = entity.newValue;
    res.note = entity.note;
    res.createdAt = entity.createdAt;
    return res;
  }
}

export class TicketResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  condominiumId: string;

  @ApiProperty()
  @Expose()
  folio: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty({ enum: TicketCategory })
  @Expose()
  category: TicketCategory;

  @ApiProperty({ enum: TicketPriority })
  @Expose()
  priority: TicketPriority;

  @ApiProperty({ enum: TicketStatus })
  @Expose()
  status: TicketStatus;

  @ApiProperty({ enum: TicketScope })
  @Expose()
  scope: TicketScope;

  @ApiPropertyOptional()
  @Expose()
  locationDetail?: string | null;

  @ApiProperty()
  @Expose()
  creatorId: string;

  @ApiPropertyOptional()
  @Expose()
  creatorName?: string;

  @ApiPropertyOptional()
  @Expose()
  creatorPhone?: string | null;

  @ApiPropertyOptional()
  @Expose()
  creatorEmail?: string;

  @ApiPropertyOptional()
  @Expose()
  houseId?: string | null;

  @ApiPropertyOptional()
  @Expose()
  houseNumber?: string | null;

  @ApiPropertyOptional()
  @Expose()
  assignedAdminId?: string | null;

  @ApiPropertyOptional()
  @Expose()
  assignedAdminName?: string | null;

  @ApiPropertyOptional()
  @Expose()
  providerId?: string | null;

  @ApiPropertyOptional()
  @Expose()
  providerName?: string | null;

  @ApiPropertyOptional()
  @Expose()
  expenseId?: string | null;

  @ApiPropertyOptional()
  @Expose()
  satisfactionRating?: number | null;

  @ApiPropertyOptional()
  @Expose()
  satisfactionComment?: string | null;

  @ApiProperty({ type: [TicketAttachmentResponse] })
  @Expose()
  @Type(() => TicketAttachmentResponse)
  attachments: TicketAttachmentResponse[];

  @ApiProperty({ type: [TicketCommentResponse] })
  @Expose()
  @Type(() => TicketCommentResponse)
  comments: TicketCommentResponse[];

  @ApiProperty({ type: [TicketHistoryResponse] })
  @Expose()
  @Type(() => TicketHistoryResponse)
  history: TicketHistoryResponse[];

  @ApiPropertyOptional()
  @Expose()
  resolvedAt?: Date | null;

  @ApiPropertyOptional()
  @Expose()
  closedAt?: Date | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: TicketEntity): TicketResponse {
    const res = new TicketResponse();
    res.id = entity.id;
    res.condominiumId = entity.condominiumId;
    res.folio = entity.folio;
    res.title = entity.title;
    res.description = entity.description;
    res.category = entity.category;
    res.priority = entity.priority;
    res.status = entity.status;
    res.scope = entity.scope;
    res.locationDetail = entity.locationDetail;
    res.creatorId = entity.creatorId;
    res.creatorName = entity.creatorName;
    res.creatorPhone = entity.creatorPhone;
    res.creatorEmail = entity.creatorEmail;
    res.houseId = entity.houseId;
    res.houseNumber = entity.houseNumber;
    res.assignedAdminId = entity.assignedAdminId;
    res.assignedAdminName = entity.assignedAdminName;
    res.providerId = entity.providerId;
    res.providerName = entity.providerName;
    res.expenseId = entity.expenseId;
    res.satisfactionRating = entity.satisfactionRating;
    res.satisfactionComment = entity.satisfactionComment;
    res.attachments = entity.attachments
      ? entity.attachments.map((att) => TicketAttachmentResponse.fromEntity(att))
      : [];
    res.comments = entity.comments
      ? entity.comments.map((c) => TicketCommentResponse.fromEntity(c))
      : [];
    res.history = entity.history
      ? entity.history.map((h) => TicketHistoryResponse.fromEntity(h))
      : [];
    res.resolvedAt = entity.resolvedAt;
    res.closedAt = entity.closedAt;
    res.createdAt = entity.createdAt;
    res.updatedAt = entity.updatedAt;
    return res;
  }
}

export class PaginatedTicketsResponse {
  @ApiProperty({ type: [TicketResponse] })
  @Expose()
  @Type(() => TicketResponse)
  tickets: TicketResponse[];

  @ApiProperty()
  @Expose()
  total: number;

  @ApiProperty()
  @Expose()
  page: number;

  @ApiProperty()
  @Expose()
  limit: number;

  @ApiProperty()
  @Expose()
  totalPages: number;
}
