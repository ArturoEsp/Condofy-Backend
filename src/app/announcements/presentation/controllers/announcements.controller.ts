import 'multer';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { StorageService } from '@/core/domain/services/storage.service';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';

import * as docs from '../docs/announcements.docs';
import { CreateAnnouncementUseCase } from '../../application/use-cases/create-announcement.usecase';
import { GetAnnouncementsUseCase } from '../../application/use-cases/get-announcements.usecase';
import { GetAnnouncementByIdUseCase } from '../../application/use-cases/get-announcement-by-id.usecase';
import { UpdateAnnouncementUseCase } from '../../application/use-cases/update-announcement.usecase';
import { ToggleAnnouncementActiveUseCase } from '../../application/use-cases/toggle-announcement-active.usecase';
import { DeleteAnnouncementUseCase } from '../../application/use-cases/delete-announcement.usecase';
import { RecordAnnouncementReadUseCase } from '../../application/use-cases/record-announcement-read.usecase';

import { CreateAnnouncementRequest } from '../dtos/requests/create-announcement.request';
import { UpdateAnnouncementRequest } from '../dtos/requests/update-announcement.request';
import { ParamsListAnnouncementsRequest } from '../dtos/requests/params-list-announcements.request';
import {
  AnnouncementResponse,
  computeAnnouncementStatus,
} from '../dtos/responses/announcement.response';
import { AnnouncementEntity } from '../../domain/entities/announcement.entity';
import { CreateAnnouncementAttachmentData } from '../../domain/repositories/announcements.repository';

const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const ALLOWED_ATTACHMENT_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB por imagen
const MAX_DOC_SIZE = 20 * 1024 * 1024; // 20 MB para documento adjunto

const formatFileSize = (bytes: number): string => {
  if (bytes > 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
};

const mapToResponse = (
  entity: AnnouncementEntity,
  options?: { hideReaders?: boolean },
): AnnouncementResponse => {
  return {
    id: entity.id,
    condominiumId: entity.condominiumId,
    title: entity.title,
    previewMessage: entity.previewMessage,
    content: entity.content,
    category: entity.category,
    priority: entity.priority,
    status: computeAnnouncementStatus(
      entity.isActive,
      entity.startDate,
      entity.endDate,
    ),
    startDate: entity.startDate,
    endDate: entity.endDate,
    isActive: entity.isActive,
    authorName: entity.authorName,
    viewsCount: entity.viewsCount,
    attachments: (entity.attachments || []).map((att) => ({
      id: att.id,
      announcementId: att.announcementId,
      type: att.type,
      fileUrl: att.fileUrl,
      fileName: att.fileName,
      fileSize: att.fileSize,
      mimeType: att.mimeType,
      order: att.order,
      createdAt: att.createdAt,
    })),
    readers: options?.hideReaders
      ? undefined
      : entity.readers?.map((r) => ({
          id: r.id,
          announcementId: r.announcementId,
          userId: r.userId,
          residentName: r.residentName,
          houseId: r.houseId,
          houseNumber: r.houseNumber,
          readAt: r.readAt,
        })),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
};

@ApiTags('Announcements')
@Controller(':condominiumKey/announcements')
export class AnnouncementsController {
  constructor(
    private readonly createAnnouncementUseCase: CreateAnnouncementUseCase,
    private readonly getAnnouncementsUseCase: GetAnnouncementsUseCase,
    private readonly getAnnouncementByIdUseCase: GetAnnouncementByIdUseCase,
    private readonly updateAnnouncementUseCase: UpdateAnnouncementUseCase,
    private readonly toggleAnnouncementActiveUseCase: ToggleAnnouncementActiveUseCase,
    private readonly deleteAnnouncementUseCase: DeleteAnnouncementUseCase,
    private readonly recordAnnouncementReadUseCase: RecordAnnouncementReadUseCase,
    @Inject(PROVIDES_NAMES.StorageService)
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @Roles('ADMIN')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photos', maxCount: 3 },
      { name: 'attachment', maxCount: 1 },
    ]),
  )
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiEndpoint(docs.createAnnouncement)
  async create(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() data: CreateAnnouncementRequest,
    @UploadedFiles()
    files?: {
      photos?: Express.Multer.File[];
      attachment?: Express.Multer.File[];
    },
  ): Promise<AnnouncementResponse> {
    const uploadedAttachments: CreateAnnouncementAttachmentData[] = [];

    // Validar y subir fotos (máx. 3)
    if (files?.photos && files.photos.length > 0) {
      if (files.photos.length > 3) {
        throw new BadRequestException(
          'Se permite un máximo de 3 fotos por comunicado',
        );
      }

      for (let i = 0; i < files.photos.length; i++) {
        const photo = files.photos[i];

        if (!ALLOWED_IMAGE_MIMES.includes(photo.mimetype)) {
          throw new BadRequestException(
            `El archivo "${photo.originalname}" no es una imagen válida (formatos permitidos: JPEG, PNG, WebP)`,
          );
        }

        if (photo.size > MAX_IMAGE_SIZE) {
          throw new BadRequestException(
            `La imagen "${photo.originalname}" supera el límite de 10 MB`,
          );
        }

        const path = this.storageService.buildStoragePath({
          condominiumId,
          module: 'announcements',
          fileName: photo.originalname,
        });

        const uploadResult = await this.storageService.uploadFile({
          file: {
            buffer: photo.buffer,
            mimetype: photo.mimetype,
            originalname: photo.originalname,
            size: photo.size,
          },
          path,
          isPublic: true,
          contentType: photo.mimetype,
        });

        uploadedAttachments.push({
          type: 'IMAGE',
          fileUrl: uploadResult.url || uploadResult.key,
          fileName: photo.originalname,
          fileSize: formatFileSize(photo.size),
          mimeType: photo.mimetype,
          order: i,
        });
      }
    }

    // Validar y subir archivo adicional (máx. 1)
    if (files?.attachment && files.attachment.length > 0) {
      const doc = files.attachment[0];

      if (!ALLOWED_ATTACHMENT_MIMES.includes(doc.mimetype)) {
        throw new BadRequestException(
          `Tipo de archivo adjunto no permitido (${doc.mimetype}). Se admiten PDF, Word, Excel o imágenes.`,
        );
      }

      if (doc.size > MAX_DOC_SIZE) {
        throw new BadRequestException(
          `El archivo adjunto "${doc.originalname}" supera el límite de 20 MB`,
        );
      }

      const path = this.storageService.buildStoragePath({
        condominiumId,
        module: 'announcements',
        fileName: doc.originalname,
      });

      const uploadResult = await this.storageService.uploadFile({
        file: {
          buffer: doc.buffer,
          mimetype: doc.mimetype,
          originalname: doc.originalname,
          size: doc.size,
        },
        path,
        isPublic: true,
        contentType: doc.mimetype,
      });

      uploadedAttachments.push({
        type: 'DOCUMENT',
        fileUrl: uploadResult.url || uploadResult.key,
        fileName: doc.originalname,
        fileSize: formatFileSize(doc.size),
        mimeType: doc.mimetype,
        order: 99,
      });
    }

    const authorName = data.authorName?.trim() || 'Administración';

    const announcement = await this.createAnnouncementUseCase.execute({
      condominiumId,
      createdById: user.id,
      authorName,
      title: data.title,
      previewMessage: data.previewMessage,
      content: data.content,
      category: data.category,
      priority: data.priority,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : null,
      isActive: data.isActive,
      attachments: uploadedAttachments,
    });

    return mapToResponse(announcement);
  }

  @Get()
  @Roles('ADMIN', 'RESIDENT', 'STAND')
  @ApiEndpoint(docs.getAnnouncements)
  async findAll(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Query() query: ParamsListAnnouncementsRequest,
  ): Promise<AnnouncementResponse[]> {
    const isResidentOrStand = user.role === 'RESIDENT' || user.role === 'STAND';

    const announcements = await this.getAnnouncementsUseCase.execute({
      condominiumId,
      status: query.status,
      category: query.category,
      priority: query.priority,
      search: query.search,
      activeOnly: isResidentOrStand,
    });

    return announcements.map((a) =>
      mapToResponse(a, { hideReaders: isResidentOrStand }),
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'RESIDENT', 'STAND')
  @ApiEndpoint(docs.getAnnouncementById)
  async findOne(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
  ): Promise<AnnouncementResponse> {
    const announcement = await this.getAnnouncementByIdUseCase.execute(
      id,
      condominiumId,
    );

    const isResidentOrStand = user.role === 'RESIDENT' || user.role === 'STAND';
    return mapToResponse(announcement, { hideReaders: isResidentOrStand });
  }

  @Put(':id')
  @Roles('ADMIN')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photos', maxCount: 3 },
      { name: 'attachment', maxCount: 1 },
    ]),
  )
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiEndpoint(docs.updateAnnouncement)
  async update(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body() data: UpdateAnnouncementRequest,
    @UploadedFiles()
    files?: {
      photos?: Express.Multer.File[];
      attachment?: Express.Multer.File[];
    },
  ): Promise<AnnouncementResponse> {
    const newAttachments: CreateAnnouncementAttachmentData[] = [];

    if (files?.photos && files.photos.length > 0) {
      for (let i = 0; i < files.photos.length; i++) {
        const photo = files.photos[i];

        if (!ALLOWED_IMAGE_MIMES.includes(photo.mimetype)) {
          throw new BadRequestException(
            `El archivo "${photo.originalname}" no es una imagen válida`,
          );
        }

        const path = this.storageService.buildStoragePath({
          condominiumId,
          module: 'announcements',
          fileName: photo.originalname,
        });

        const uploadResult = await this.storageService.uploadFile({
          file: {
            buffer: photo.buffer,
            mimetype: photo.mimetype,
            originalname: photo.originalname,
            size: photo.size,
          },
          path,
          isPublic: true,
          contentType: photo.mimetype,
        });

        newAttachments.push({
          type: 'IMAGE',
          fileUrl: uploadResult.url || uploadResult.key,
          fileName: photo.originalname,
          fileSize: formatFileSize(photo.size),
          mimeType: photo.mimetype,
          order: i,
        });
      }
    }

    if (files?.attachment && files.attachment.length > 0) {
      const doc = files.attachment[0];

      if (!ALLOWED_ATTACHMENT_MIMES.includes(doc.mimetype)) {
        throw new BadRequestException(
          `Tipo de archivo adjunto no permitido (${doc.mimetype})`,
        );
      }

      const path = this.storageService.buildStoragePath({
        condominiumId,
        module: 'announcements',
        fileName: doc.originalname,
      });

      const uploadResult = await this.storageService.uploadFile({
        file: {
          buffer: doc.buffer,
          mimetype: doc.mimetype,
          originalname: doc.originalname,
          size: doc.size,
        },
        path,
        isPublic: true,
        contentType: doc.mimetype,
      });

      newAttachments.push({
        type: 'DOCUMENT',
        fileUrl: uploadResult.url || uploadResult.key,
        fileName: doc.originalname,
        fileSize: formatFileSize(doc.size),
        mimeType: doc.mimetype,
        order: 99,
      });
    }

    const updated = await this.updateAnnouncementUseCase.execute(
      id,
      condominiumId,
      {
        title: data.title,
        authorName: data.authorName?.trim(),
        previewMessage: data.previewMessage,
        content: data.content,
        category: data.category,
        priority: data.priority,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive,
        keepAttachmentIds: data.keepAttachmentIds,
        newAttachments: newAttachments.length > 0 ? newAttachments : undefined,
      },
    );

    return mapToResponse(updated);
  }

  @Patch(':id/toggle-active')
  @Roles('ADMIN')
  @ApiEndpoint(docs.toggleAnnouncementActive)
  async toggleActive(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ): Promise<AnnouncementResponse> {
    const updated = await this.toggleAnnouncementActiveUseCase.execute(
      id,
      condominiumId,
    );
    return mapToResponse(updated);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiEndpoint(docs.deleteAnnouncement)
  async delete(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.deleteAnnouncementUseCase.execute(id, condominiumId);
    return { success: true, message: 'Comunicado eliminado correctamente' };
  }

  @Post(':id/read')
  @Roles('RESIDENT', 'ADMIN', 'STAND')
  @ApiEndpoint(docs.recordAnnouncementRead)
  async recordRead(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
  ): Promise<{ success: boolean; wasRecorded: boolean }> {
    const result = await this.recordAnnouncementReadUseCase.execute({
      announcementId: id,
      userId: user.id,
      condominiumId,
    });

    return { success: true, wasRecorded: result.wasRecorded };
  }
}
