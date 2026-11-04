import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { ITicketsRepository } from '../../domain/repositories/tickets.repository.interface';
import { CreateTicketRequest } from '../../presentation/dtos/requests/create-ticket.request';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';

@Injectable()
export class CreateTicketUseCase {
  private readonly logger = new Logger(CreateTicketUseCase.name);

  constructor(
    @Inject(PROVIDES_NAMES.TicketsRepository)
    private readonly repository: ITicketsRepository,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(
    condominiumId: string,
    creatorId: string,
    dto: CreateTicketRequest,
  ): Promise<TicketEntity> {
    // REGLA DE NEGOCIO: Máximo 3 fotos por reporte
    if (dto.attachments && dto.attachments.length > 3) {
      throw new BadRequestException('Solo se permite adjuntar un máximo de 3 fotos para el reporte');
    }

    // Si no se proveyó houseId, intentar resolver la casa del perfil del usuario
    let houseId = dto.houseId;
    if (!houseId) {
      const userHouseId = await this.repository.getUserCondominiumHouseId(creatorId, condominiumId);
      if (userHouseId) {
        houseId = userHouseId;
      }
    }

    const folio = await this.repository.getNextFolio(condominiumId);

    const ticket = await this.repository.create({
      condominiumId,
      creatorId,
      houseId,
      folio,
      title: dto.title.trim(),
      description: dto.description.trim(),
      category: dto.category,
      priority: dto.priority,
      scope: dto.scope,
      locationDetail: dto.locationDetail?.trim(),
      attachments: dto.attachments?.map((att) => ({
        fileUrl: att.fileUrl,
        fileName: att.fileName,
        fileSize: att.fileSize,
        mimeType: att.mimeType,
      })),
    });

    // Registrar bitácora inicial
    await this.repository.addHistory({
      ticketId: ticket.id,
      changedById: creatorId,
      action: 'CREATED',
      newValue: ticket.status,
      note: 'Ticket reportado inicialmente',
    });

    // Notificar a los administradores del condominio mediante WebPush
    this.notifyAdmins(condominiumId, ticket).catch((err) => {
      this.logger.error(`Error enviando notificación push a administradores: ${err.message}`);
    });

    return ticket;
  }

  private async notifyAdmins(condominiumId: string, ticket: TicketEntity): Promise<void> {
    try {
      const adminIds = await this.repository.getCondominiumAdminUserIds(condominiumId);
      if (!adminIds || adminIds.length === 0) return;

      await this.webPushService.sendNotificationToUsers(adminIds, {
        title: `Nuevo reporte #${ticket.folio}: ${ticket.title}`,
        body: `Categoría: ${ticket.category}. Prioridad: ${ticket.priority}.`,
        url: '/admin/tickets',
        tag: `ticket-${ticket.id}`,
      });
    } catch (err: any) {
      this.logger.warn(`No se pudo enviar WebPush para ticket #${ticket.folio}: ${err.message}`);
    }
  }
}

