import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { ITicketsRepository } from '../../domain/repositories/tickets.repository.interface';
import { AssignTicketRequest } from '../../presentation/dtos/requests/assign-ticket.request';
import { TicketEntity } from '../../domain/entities/ticket.entity';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';

@Injectable()
export class AssignTicketUseCase {
  private readonly logger = new Logger(AssignTicketUseCase.name);

  constructor(
    @Inject(PROVIDES_NAMES.TicketsRepository)
    private readonly repository: ITicketsRepository,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(
    id: string,
    condominiumId: string,
    changedById: string,
    dto: AssignTicketRequest,
  ): Promise<TicketEntity> {
    const existing = await this.repository.findById(id, condominiumId);
    if (!existing) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    const updated = await this.repository.update(id, condominiumId, {
      assignedAdminId: dto.assignedAdminId !== undefined ? dto.assignedAdminId : existing.assignedAdminId,
      providerId: dto.providerId !== undefined ? dto.providerId : existing.providerId,
    });

    await this.repository.addHistory({
      ticketId: id,
      changedById,
      action: 'ASSIGNED',
      oldValue: existing.assignedAdminId ?? undefined,
      newValue: dto.assignedAdminId ?? (dto.providerId ? `PROV:${dto.providerId}` : undefined),
      note: dto.note?.trim() || 'Asignación de responsable o proveedor actualizada',
    });

    if (dto.assignedAdminId && dto.assignedAdminId !== changedById) {
      this.notifyAssignedAdmin(dto.assignedAdminId, updated).catch((err) => {
        this.logger.error(`Error enviando notificación al admin asignado: ${err.message}`);
      });
    }

    return updated;
  }

  private async notifyAssignedAdmin(adminId: string, ticket: TicketEntity): Promise<void> {
    try {
      await this.webPushService.sendNotificationToUser(adminId, {
        title: `Se te asignó el reporte #${ticket.folio}`,
        body: `${ticket.title} (Prioridad: ${ticket.priority})`,
        url: '/admin/tickets',
        tag: `ticket-${ticket.id}`,
      });
    } catch (err: any) {
      this.logger.warn(`No se pudo notificar asignación al admin ${adminId}: ${err.message}`);
    }
  }
}

