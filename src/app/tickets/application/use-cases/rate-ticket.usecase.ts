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
import { RateTicketRequest } from '../../presentation/dtos/requests/rate-ticket.request';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';

@Injectable()
export class RateTicketUseCase {
  private readonly logger = new Logger(RateTicketUseCase.name);

  constructor(
    @Inject(PROVIDES_NAMES.TicketsRepository)
    private readonly repository: ITicketsRepository,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(
    ticketId: string,
    condominiumId: string,
    currentUser: AuthUserEntity,
    dto: RateTicketRequest,
  ): Promise<TicketEntity> {
    const ticket = await this.repository.findById(ticketId, condominiumId);
    if (!ticket) {
      throw new NotFoundException(`Ticket #${ticketId} no encontrado`);
    }

    if (currentUser.role === UserRole.RESIDENT && ticket.creatorId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para calificar este ticket');
    }

    if (ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED) {
      throw new BadRequestException('Solo se pueden calificar tickets que hayan sido resueltos o cerrados');
    }

    if (ticket.satisfactionRating) {
      throw new BadRequestException('Este reporte ya ha sido calificado previamente.');
    }

    const updated = await this.repository.update(ticketId, condominiumId, {
      status: TicketStatus.CLOSED,
      closedAt: ticket.closedAt || new Date(),
      satisfactionRating: dto.satisfactionRating,
      satisfactionComment: dto.satisfactionComment?.trim(),
    });

    await this.repository.addHistory({
      ticketId,
      changedById: currentUser.id,
      action: 'RATED_AND_CLOSED',
      oldValue: ticket.status,
      newValue: TicketStatus.CLOSED,
      note: `Calificado con ${dto.satisfactionRating} estrellas: ${dto.satisfactionComment || 'Sin comentarios'}`,
    });

    // Notificar al admin asignado o a todos los admins sobre la calificación
    this.notifyAdmins(condominiumId, updated, dto.satisfactionRating).catch((err) => {
      this.logger.error(`Error enviando notificación push de calificación: ${err.message}`);
    });

    return updated;
  }

  private async notifyAdmins(
    condominiumId: string,
    ticket: TicketEntity,
    stars: number,
  ): Promise<void> {
    try {
      const targetIds = ticket.assignedAdminId
        ? [ticket.assignedAdminId]
        : await this.repository.getCondominiumAdminUserIds(condominiumId);

      if (!targetIds || targetIds.length === 0) return;

      await this.webPushService.sendNotificationToUsers(targetIds, {
        title: `Reporte #${ticket.folio} calificado ⭐ (${stars}/5)`,
        body: `El residente calificó la atención del reporte "${ticket.title}".`,
        url: '/admin/tickets',
        tag: `ticket-${ticket.id}`,
      });
    } catch (err: any) {
      this.logger.warn(`No se pudo enviar notificación de calificación: ${err.message}`);
    }
  }
}

