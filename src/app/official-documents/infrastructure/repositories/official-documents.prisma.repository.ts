import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@/core/infrastructure/persistence/prisma/generated/client';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { StorageService } from '@/core/domain/services/storage.service';
import {
  CreateOfficialDocumentData,
  FindAllOfficialDocumentsParams,
  FindResidentOfficialDocumentsParams,
  OfficialDocumentsRepository,
  UpdateOfficialDocumentData,
} from '../../domain/repositories/official-documents.repository';
import { OfficialDocumentEntity } from '../../domain/entities/official-document.entity';
import { OfficialDocumentAcknowledgmentEntity } from '../../domain/entities/official-document-acknowledgment.entity';
import {
  OfficialDocumentMapper,
  PrismaAcknowledgmentWithUserAndHouse,
  PrismaOfficialDocumentWithRelations,
} from '../mappers/official-document.mapper';

@Injectable()
export class OfficialDocumentsPrismaRepository implements OfficialDocumentsRepository {
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

  private async resolveFileUrl(rawUrlOrKey: string): Promise<string> {
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

  private async mapToDomain(
    raw: PrismaOfficialDocumentWithRelations,
  ): Promise<OfficialDocumentEntity> {
    const domain = OfficialDocumentMapper.toDomain(raw);
    const resolvedUrl = await this.resolveFileUrl(domain.fileUrl);

    return new OfficialDocumentEntity({
      ...domain,
      fileUrl: resolvedUrl,
    });
  }

  async create(
    data: CreateOfficialDocumentData,
  ): Promise<OfficialDocumentEntity> {
    const created = await this.prisma.officialDocument.create({
      data: {
        condominiumId: data.condominiumId,
        title: data.title,
        description: data.description,
        category: data.category,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        version: data.version,
        isPublished: data.isPublished,
        requiresAcknowledgment: data.requiresAcknowledgment,
        targetScope: data.targetScope,
        createdById: data.createdById,
        assignedHouses:
          data.targetScope === 'SPECIFIC_HOUSES' &&
          data.assignedHouseIds &&
          data.assignedHouseIds.length > 0
            ? {
                create: data.assignedHouseIds.map((houseId) => ({
                  houseId,
                })),
              }
            : undefined,
      },
      include: {
        assignedHouses: true,
        _count: {
          select: {
            acknowledgments: true,
          },
        },
      },
    });

    return this.mapToDomain(created);
  }

  async findById(
    id: string,
    condominiumId: string,
    userId?: string,
  ): Promise<OfficialDocumentEntity | null> {
    const raw = await this.prisma.officialDocument.findFirst({
      where: {
        id,
        condominiumId,
      },
      include: {
        assignedHouses: true,
        acknowledgments: true,
      },
    });

    if (!raw) return null;

    let hasUserAcknowledged = false;
    let hasUserViewed = false;

    if (userId && raw.acknowledgments) {
      const userAck = raw.acknowledgments.find((ack) => ack.userId === userId);
      if (userAck) {
        hasUserViewed = true;
        hasUserAcknowledged = userAck.acknowledgedAt !== null;
      }
    }

    const domain = await this.mapToDomain(raw);
    return new OfficialDocumentEntity({
      ...domain,
      hasUserAcknowledged,
      hasUserViewed,
    });
  }

  async findAll(
    params: FindAllOfficialDocumentsParams,
  ): Promise<{ documents: OfficialDocumentEntity[]; total: number }> {
    const where: Prisma.OfficialDocumentWhereInput = {
      condominiumId: params.condominiumId,
      ...(params.category ? { category: params.category } : {}),
      ...(params.isPublished !== undefined
        ? { isPublished: params.isPublished }
        : {}),
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search, mode: 'insensitive' } },
              {
                description: { contains: params.search, mode: 'insensitive' },
              },
              { fileName: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rawDocuments, total] = await Promise.all([
      this.prisma.officialDocument.findMany({
        where,
        include: {
          assignedHouses: true,
          acknowledgments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.officialDocument.count({ where }),
    ]);

    const documents = await Promise.all(
      rawDocuments.map((doc) => this.mapToDomain(doc)),
    );

    return { documents, total };
  }

  async findForResident(
    params: FindResidentOfficialDocumentsParams,
  ): Promise<OfficialDocumentEntity[]> {
    let houseId = params.houseId;
    if (!houseId) {
      const profile = await this.prisma.residentProfile.findFirst({
        where: {
          userId: params.userId,
          condominiumId: params.condominiumId,
        },
        select: { houseId: true },
      });
      houseId = profile?.houseId ?? null;
    }

    const where: Prisma.OfficialDocumentWhereInput = {
      condominiumId: params.condominiumId,
      isPublished: true,
      ...(params.category ? { category: params.category } : {}),
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search, mode: 'insensitive' } },
              {
                description: { contains: params.search, mode: 'insensitive' },
              },
              { fileName: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      OR: [
        { targetScope: 'ALL' },
        ...(houseId
          ? [
              {
                targetScope: 'SPECIFIC_HOUSES' as const,
                assignedHouses: {
                  some: {
                    houseId,
                  },
                },
              },
            ]
          : []),
      ],
    };

    const rawDocuments = await this.prisma.officialDocument.findMany({
      where,
      include: {
        assignedHouses: true,
        acknowledgments: {
          where: {
            userId: params.userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Promise.all(
      rawDocuments.map(async (raw) => {
        const userAck = raw.acknowledgments?.[0];
        const hasUserViewed = !!userAck;
        const hasUserAcknowledged = !!userAck?.acknowledgedAt;

        const domain = await this.mapToDomain(raw);
        return new OfficialDocumentEntity({
          ...domain,
          hasUserAcknowledged,
          hasUserViewed,
        });
      }),
    );
  }

  async update(
    id: string,
    condominiumId: string,
    data: UpdateOfficialDocumentData,
  ): Promise<OfficialDocumentEntity> {
    const existing = await this.prisma.officialDocument.findFirst({
      where: { id, condominiumId },
      include: { assignedHouses: true },
    });

    if (!existing) {
      throw new NotFoundException(
        'El documento oficial solicitado no fue encontrado',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (
        data.targetScope === 'SPECIFIC_HOUSES' &&
        data.assignedHouseIds !== undefined
      ) {
        await tx.officialDocumentHouse.deleteMany({
          where: { documentId: id },
        });

        if (data.assignedHouseIds.length > 0) {
          await tx.officialDocumentHouse.createMany({
            data: data.assignedHouseIds.map((houseId) => ({
              documentId: id,
              houseId,
            })),
          });
        }
      } else if (data.targetScope === 'ALL' || data.targetScope === 'PRIVATE') {
        await tx.officialDocumentHouse.deleteMany({
          where: { documentId: id },
        });
      }

      return tx.officialDocument.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          version: data.version,
          isPublished: data.isPublished,
          requiresAcknowledgment: data.requiresAcknowledgment,
          targetScope: data.targetScope,
        },
        include: {
          assignedHouses: true,
          acknowledgments: true,
        },
      });
    });

    return this.mapToDomain(updated);
  }

  async togglePublish(
    id: string,
    condominiumId: string,
    isPublished: boolean,
  ): Promise<OfficialDocumentEntity> {
    const existing = await this.prisma.officialDocument.findFirst({
      where: { id, condominiumId },
    });

    if (!existing) {
      throw new NotFoundException('Documento no encontrado');
    }

    const updated = await this.prisma.officialDocument.update({
      where: { id },
      data: { isPublished },
      include: {
        assignedHouses: true,
        acknowledgments: true,
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: string, condominiumId: string): Promise<void> {
    const existing = await this.prisma.officialDocument.findFirst({
      where: { id, condominiumId },
    });

    if (!existing) {
      throw new NotFoundException('Documento no encontrado');
    }

    await this.prisma.officialDocument.delete({
      where: { id },
    });
  }

  async recordView(
    documentId: string,
    userId: string,
    houseId?: string | null,
  ): Promise<void> {
    let effectiveHouseId = houseId;
    if (!effectiveHouseId) {
      const doc = await this.prisma.officialDocument.findUnique({
        where: { id: documentId },
        select: { condominiumId: true },
      });
      if (doc) {
        const profile = await this.prisma.residentProfile.findFirst({
          where: { userId, condominiumId: doc.condominiumId },
          select: { houseId: true },
        });
        effectiveHouseId = profile?.houseId ?? null;
      }
    }

    await this.prisma.officialDocumentAcknowledgment.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId,
        },
      },
      update: {
        viewedAt: new Date(),
        ...(effectiveHouseId ? { houseId: effectiveHouseId } : {}),
      },
      create: {
        documentId,
        userId,
        houseId: effectiveHouseId ?? null,
        viewedAt: new Date(),
      },
    });
  }

  async recordAcknowledgment(
    documentId: string,
    userId: string,
    houseId?: string | null,
  ): Promise<OfficialDocumentAcknowledgmentEntity> {
    let effectiveHouseId = houseId;
    if (!effectiveHouseId) {
      const doc = await this.prisma.officialDocument.findUnique({
        where: { id: documentId },
        select: { condominiumId: true },
      });
      if (doc) {
        const profile = await this.prisma.residentProfile.findFirst({
          where: { userId, condominiumId: doc.condominiumId },
          select: { houseId: true },
        });
        effectiveHouseId = profile?.houseId ?? null;
      }
    }

    const updated = await this.prisma.officialDocumentAcknowledgment.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId,
        },
      },
      update: {
        acknowledgedAt: new Date(),
        ...(effectiveHouseId ? { houseId: effectiveHouseId } : {}),
      },
      create: {
        documentId,
        userId,
        houseId: effectiveHouseId ?? null,
        acknowledgedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        house: {
          select: {
            id: true,
            houseNumber: true,
            tower: true,
          },
        },
      },
    });

    return OfficialDocumentMapper.acknowledgmentToDomain(
      updated as PrismaAcknowledgmentWithUserAndHouse,
    );
  }

  async findAcknowledgments(
    documentId: string,
    condominiumId: string,
  ): Promise<OfficialDocumentAcknowledgmentEntity[]> {
    const document = await this.prisma.officialDocument.findFirst({
      where: { id: documentId, condominiumId },
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    const raw = await this.prisma.officialDocumentAcknowledgment.findMany({
      where: { documentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        house: {
          select: {
            id: true,
            houseNumber: true,
            tower: true,
          },
        },
      },
      orderBy: {
        viewedAt: 'desc',
      },
    });

    return raw.map((ack) =>
      OfficialDocumentMapper.acknowledgmentToDomain(
        ack as PrismaAcknowledgmentWithUserAndHouse,
      ),
    );
  }

  async getResidentUserIds(
    condominiumId: string,
    houseIds?: string[],
  ): Promise<string[]> {
    const where: Prisma.ResidentProfileWhereInput = {
      condominiumId,
      ...(houseIds && houseIds.length > 0 ? { houseId: { in: houseIds } } : {}),
    };

    const residents = await this.prisma.residentProfile.findMany({
      where,
      select: {
        userId: true,
      },
    });

    return [...new Set(residents.map((r) => r.userId))];
  }
}
