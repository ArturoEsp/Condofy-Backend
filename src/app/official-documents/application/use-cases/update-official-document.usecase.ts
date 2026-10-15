import { Inject, Injectable, Logger } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';
import { OfficialDocumentsRepository } from '../../domain/repositories/official-documents.repository';
import { OfficialDocumentEntity } from '../../domain/entities/official-document.entity';
import { UpdateOfficialDocumentCommand } from '../commands/update-official-document.command';

@Injectable()
export class UpdateOfficialDocumentUseCase {
  private readonly logger = new Logger(UpdateOfficialDocumentUseCase.name);

  constructor(
    @Inject(PROVIDES_NAMES.OfficialDocumentsRepository)
    private readonly repository: OfficialDocumentsRepository,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(
    command: UpdateOfficialDocumentCommand,
  ): Promise<OfficialDocumentEntity> {
    const updated = await this.repository.update(
      command.id,
      command.condominiumId,
      {
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
        assignedHouseIds: command.assignedHouseIds,
      },
    );

    if (
      command.notifyResidents &&
      updated.isPublished &&
      updated.targetScope !== 'PRIVATE'
    ) {
      this.sendNotification(updated, command.assignedHouseIds).catch((err) => {
        this.logger.error('Error al enviar notificaciones push en update:', err);
      });
    }

    return updated;
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
        title: `Documento oficial actualizado: ${document.title}`,
        body: document.requiresAcknowledgment
          ? 'Por favor revisa el documento y confirma tu acuse de recibido.'
          : 'Se ha publicado una actualización de este documento oficial.',
        url: '/residente/documentos',
        tag: `document-${document.id}`,
      });
    } catch (error) {
      this.logger.error('Error al enviar push de actualización', error);
    }
  }
}

