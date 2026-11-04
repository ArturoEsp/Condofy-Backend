import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { ITicketsRepository } from '../../domain/repositories/tickets.repository.interface';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';
import { UserRole } from '@/core/infrastructure/persistence/prisma/generated/enums';
import { TicketEntity } from '../../domain/entities/ticket.entity';

@Injectable()
export class GetTicketByIdUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.TicketsRepository)
    private readonly repository: ITicketsRepository,
  ) {}

  async execute(
    id: string,
    condominiumId: string,
    currentUser: AuthUserEntity,
  ): Promise<TicketEntity> {
    const ticket = await this.repository.findById(id, condominiumId);

    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} no encontrado`);
    }

    const isResident = currentUser.role === UserRole.RESIDENT;

    // Un residente solo puede consultar su propio ticket
    if (isResident && ticket.creatorId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para ver este ticket');
    }

    if (isResident) {
      return {
        ...ticket,
        comments: ticket.comments?.filter((c) => !c.isInternal) ?? [],
      };
    }

    return ticket;
  }
}

