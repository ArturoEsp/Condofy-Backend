import { Inject, Injectable, Logger } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';
import { OfficialDocumentsRepository } from '../../domain/repositories/official-documents.repository';
import { OfficialDocumentEntity } from '../../domain/entities/official-document.entity';
import { CreateOfficialDocumentCommand } from '../commands/create-official-document.command';

@Injectable()
export class CreateOfficialDocumentUseCase {
  private readonly logger = new Logger(CreateOfficialDocumentUseCase.name);

  constructor(
    @Inject(PROVIDES_NAMES.OfficialDocumentsRepository)
    private readonly repository: OfficialDocumentsRepository,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(
    command: CreateOfficialDocumentCommand,
  ): Promise<OfficialDocumentEntity> {
    const document = await this.repository.create({
      condominiumId: command.condominiumId,
      title: command.title,
      description: command.description,
      category: command.category,
      fileUrl: command.fileUrl,
      fileName: command.fileName,
      fileSize: command.fileSize,
      mimeType: command.mimeType,
      version: command.version,
      isPublished: command.isPublished,
      requiresAcknowledgment: command.requiresAcknowledgment,
      targetScope: command.targetScope,
      createdById: command.createdById,
      assignedHouseIds: command.assignedHouseIds,
    });

    if (
      command.notifyResidents &&
      command.isPublished &&
      command.targetScope !== 'PRIVATE'
    ) {
      this.sendNotification(document, command.assignedHouseIds).catch((err) => {
        this.logger.error('Error al enviar notificaciones push del documento:', err);
      });
    }

    return document;
  }

  private async sendNotification(
    document: OfficialDocumentEntity,
    assignedHouseIds?: string[],
  ): Promise<void> {
    try {
      const houseIds =
        document.targetScope === 'SPECIFIC_HOUSES'
          ? assignedHouseIds
          : undefined;

      const userIds = await this.repository.getResidentUserIds(
        document.condominiumId,
        houseIds,
      );

      if (!userIds || userIds.length === 0) return;

      await this.webPushService.sendNotificationToUsers(userIds, {
        title: `Nuevo documento oficial: ${document.title}`,
        body: document.requiresAcknowledgment
          ? 'Se requiere acuse de lectura y aceptación de este documento.'
          : 'Consulta el documento oficial publicado por la administración.',
        url: '/residente/documentos',
        tag: `document-${document.id}`,
      });
    } catch (error) {
      this.logger.error('Error al despachar push de documento oficial', error);
    }
  }
}

