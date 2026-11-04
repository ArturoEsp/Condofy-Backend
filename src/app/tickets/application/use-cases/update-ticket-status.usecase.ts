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
import {
  UserRole,
  TicketStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';
import { UpdateTicketStatusRequest } from '../../presentation/dtos/requests/update-ticket-status.request';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';

@Injectable()
export class UpdateTicketStatusUseCase {
  private readonly logger = new Logger(UpdateTicketStatusUseCase.name);

  constructor(
    @Inject(PROVIDES_NAMES.TicketsRepository)
    private readonly repository: ITicketsRepository,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(
    id: string,
    condominiumId: string,
    currentUser: AuthUserEntity,
    dto: UpdateTicketStatusRequest,
  ): Promise<TicketEntity> {
    const existing = await this.repository.findById(id, condominiumId);
    if (!existing) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    // Bloquear edición si el ticket ya fue calificado y cerrado
    if (existing.status === TicketStatus.CLOSED && existing.satisfactionRating) {
      throw new BadRequestException(
        'Este ticket ya fue calificado por el residente y se encuentra cerrado definitivamente.',
      );
    }

    const isResident = currentUser.role === UserRole.RESIDENT;

    // Reglas para residentes: solo pueden cerrar o reabrir su propio ticket
    if (isResident) {
      if (existing.creatorId !== currentUser.id) {
        throw new ForbiddenException(
          'No tienes permiso para modificar este ticket',
        );
      }
      if (
        dto.status !== TicketStatus.CLOSED &&
        dto.status !== TicketStatus.OPEN
      ) {
        throw new BadRequestException(
          'Como residente solo puedes confirmar el cierre o reabrir el reporte',
        );
      }
    }

    const oldStatus = existing.status;
    const newStatus = dto.status;

    let resolvedAt = existing.resolvedAt;
    let closedAt = existing.closedAt;

    if (newStatus === TicketStatus.RESOLVED && !resolvedAt) {
      resolvedAt = new Date();
    } else if (newStatus === TicketStatus.CLOSED && !closedAt) {
      closedAt = new Date();
    } else if (
      newStatus === TicketStatus.OPEN ||
      newStatus === TicketStatus.IN_PROGRESS
    ) {
      // Si se reabre, resetear fecha de cierre
      closedAt = null;
    }

    const updatedTicket = await this.repository.update(id, condominiumId, {
      status: newStatus,
      priority: dto.priority ?? existing.priority,
      resolvedAt,
      closedAt,
    });

    // Registrar bitácora
    await this.repository.addHistory({
      ticketId: id,
      changedById: currentUser.id,
      action: 'STATUS_CHANGE',
      oldValue: oldStatus,
      newValue: newStatus,
      note: dto.note?.trim() || `Estatus actualizado a ${newStatus}`,
    });

    // Notificar al creador si un administrador actualizó el estatus
    if (!isResident && existing.creatorId !== currentUser.id) {
      this.notifyCreator(existing, newStatus).catch((err) => {
        this.logger.error(
          `Error enviando notificación al residente: ${err.message}`,
        );
      });
    }

    return updatedTicket;
  }

  private async notifyCreator(
    ticket: TicketEntity,
    newStatus: TicketStatus,
  ): Promise<void> {
    try {
      const statusLabels: Record<string, string> = {
        IN_REVIEW: 'en revisión por administración',
        IN_PROGRESS: 'en atención / en progreso',
        WAITING_THIRD_PARTY: 'en espera de refacciones o proveedor',
        RESOLVED:
          'marcado como RESUELTO. Por favor verifica y confirma el cierre.',
        CLOSED: 'cerrado exitosamente.',
        REJECTED: 'rechazado por administración.',
      };

      const label = statusLabels[newStatus] || newStatus;

      await this.webPushService.sendNotificationToUser(ticket.creatorId, {
        title: `Actualización de reporte #${ticket.folio}`,
        body: `Tu reporte "${ticket.title}" se encuentra ${label}`,
        url: `/residente/tickets/${ticket.id}`,
        tag: `ticket-${ticket.id}`,
      });
    } catch (err: any) {
      this.logger.warn(
        `No se pudo enviar WebPush para cambio de estatus de ticket #${ticket.folio}: ${err.message}`,
      );
    }
  }
}
