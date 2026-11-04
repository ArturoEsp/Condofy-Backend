import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { ITicketsRepository } from '../../domain/repositories/tickets.repository.interface';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';
import { TicketStatus, UserRole } from '@/core/infrastructure/persistence/prisma/generated/enums';
import { AddTicketCommentRequest } from '../../presentation/dtos/requests/add-ticket-comment.request';
import { TicketCommentEntity, TicketEntity } from '../../domain/entities/ticket.entity';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';

@Injectable()
export class AddTicketCommentUseCase {
  private readonly logger = new Logger(AddTicketCommentUseCase.name);

  constructor(
    @Inject(PROVIDES_NAMES.TicketsRepository)
    private readonly repository: ITicketsRepository,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(
    ticketId: string,
    condominiumId: string,
    currentUser: AuthUserEntity,
    dto: AddTicketCommentRequest,
  ): Promise<TicketCommentEntity> {
    const ticket = await this.repository.findById(ticketId, condominiumId);
    if (!ticket) {
      throw new NotFoundException(`Ticket #${ticketId} no encontrado`);
    }

    // Bloquear comentarios si el ticket está cerrado y calificado
    if (ticket.status === TicketStatus.CLOSED && ticket.satisfactionRating) {
      throw new BadRequestException('No se pueden agregar comentarios a un ticket calificado y archivado.');
    }

    const isResident = currentUser.role === UserRole.RESIDENT;

    if (isResident && ticket.creatorId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para comentar en este ticket');
    }

    // Los residentes nunca pueden crear notas internas
    const isInternal = isResident ? false : (dto.isInternal ?? false);

    const comment = await this.repository.addComment({
      ticketId,
      authorId: currentUser.id,
      content: dto.content.trim(),
      isInternal,
      attachments: dto.attachments,
    });

    // Si es un comentario público, enviar notificación correspondiente
    if (!isInternal) {
      this.sendCommentNotification(ticket, currentUser, dto.content.trim()).catch((err) => {
        this.logger.error(`Error enviando notificación push de comentario: ${err.message}`);
      });
    }

    return comment;
  }

  private async sendCommentNotification(
    ticket: TicketEntity,
    author: AuthUserEntity,
    contentPreview: string,
  ): Promise<void> {
    try {
      const isResident = author.role === UserRole.RESIDENT;
      const shortMsg =
        contentPreview.length > 80 ? `${contentPreview.substring(0, 80)}...` : contentPreview;

      if (isResident) {
        // El residente comentó -> notificar al admin asignado o a todos los admins
        const targetIds = ticket.assignedAdminId
          ? [ticket.assignedAdminId]
          : await this.repository.getCondominiumAdminUserIds(ticket.condominiumId);

        if (targetIds && targetIds.length > 0) {
          await this.webPushService.sendNotificationToUsers(targetIds, {
            title: `Nuevo mensaje en reporte #${ticket.folio}`,
            body: `El residente comentó: "${shortMsg}"`,
            url: `/admin/tickets`,
            tag: `ticket-${ticket.id}`,
          });
        }
      } else {
        // La administración comentó públicamente -> notificar al residente
        if (ticket.creatorId !== author.id) {
          await this.webPushService.sendNotificationToUser(ticket.creatorId, {
            title: `Respuesta de administración en reporte #${ticket.folio}`,
            body: `"${shortMsg}"`,
            url: `/residente/tickets/${ticket.id}`,
            tag: `ticket-${ticket.id}`,
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`No se pudo enviar notificación de comentario: ${err.message}`);
    }
  }
}

