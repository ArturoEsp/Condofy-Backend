import {
  OfficialDocument as PrismaOfficialDocument,
  OfficialDocumentHouse as PrismaOfficialDocumentHouse,
  OfficialDocumentAcknowledgment as PrismaOfficialDocumentAcknowledgment,
  User as PrismaUser,
  House as PrismaHouse,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { OfficialDocumentEntity } from '../../domain/entities/official-document.entity';
import { OfficialDocumentAcknowledgmentEntity } from '../../domain/entities/official-document-acknowledgment.entity';

export type PrismaOfficialDocumentWithRelations = PrismaOfficialDocument & {
  assignedHouses?: PrismaOfficialDocumentHouse[];
  acknowledgments?: PrismaOfficialDocumentAcknowledgment[];
  _count?: {
    acknowledgments?: number;
  };
  totalViews?: number;
  totalAcknowledgments?: number;
  hasUserAcknowledged?: boolean;
  hasUserViewed?: boolean;
};

export type PrismaAcknowledgmentWithUserAndHouse =
  PrismaOfficialDocumentAcknowledgment & {
    user?: Pick<PrismaUser, 'id' | 'email' | 'firstName' | 'lastName'> | null;
    house?: Pick<PrismaHouse, 'id' | 'houseNumber' | 'tower'> | null;
  };

export class OfficialDocumentMapper {
  static toDomain(
    raw: PrismaOfficialDocumentWithRelations,
  ): OfficialDocumentEntity {
    const assignedHouseIds = Array.isArray(raw.assignedHouses)
      ? raw.assignedHouses.map((h) => h.houseId)
      : [];

    let totalViews = raw.totalViews ?? 0;
    let totalAcknowledgments = raw.totalAcknowledgments ?? 0;

    if (raw.acknowledgments) {
      totalViews = raw.acknowledgments.length;
      totalAcknowledgments = raw.acknowledgments.filter(
        (a) => a.acknowledgedAt !== null,
      ).length;
    } else if (raw._count?.acknowledgments !== undefined) {
      totalViews = raw._count.acknowledgments;
    }

    return new OfficialDocumentEntity({
      id: raw.id,
      condominiumId: raw.condominiumId,
      title: raw.title,
      description: raw.description,
      category: raw.category,
      fileUrl: raw.fileUrl,
      fileName: raw.fileName,
      fileSize: raw.fileSize,
      mimeType: raw.mimeType,
      version: raw.version,
      isPublished: raw.isPublished,
      requiresAcknowledgment: raw.requiresAcknowledgment,
      targetScope: raw.targetScope,
      createdById: raw.createdById,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      assignedHouseIds,
      totalViews,
      totalAcknowledgments,
      hasUserAcknowledged: raw.hasUserAcknowledged,
      hasUserViewed: raw.hasUserViewed,
    });
  }

  static acknowledgmentToDomain(
    raw: PrismaAcknowledgmentWithUserAndHouse,
  ): OfficialDocumentAcknowledgmentEntity {
    let userName: string | null = null;
    if (raw.user) {
      const full = `${raw.user.firstName || ''} ${raw.user.lastName || ''}`.trim();
      userName = full.length > 0 ? full : raw.user.email;
    }

    const houseNumber = raw.house
      ? raw.house.tower
        ? `${raw.house.tower} - ${raw.house.houseNumber}`
        : raw.house.houseNumber
      : null;

    return new OfficialDocumentAcknowledgmentEntity({
      id: raw.id,
      documentId: raw.documentId,
      userId: raw.userId,
      houseId: raw.houseId,
      userName,
      userEmail: raw.user?.email ?? null,
      houseNumber,
      viewedAt: raw.viewedAt,
      acknowledgedAt: raw.acknowledgedAt,
    });
  }
}
