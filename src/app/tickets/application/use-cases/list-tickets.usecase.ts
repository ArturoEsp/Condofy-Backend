import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { ITicketsRepository } from '../../domain/repositories/tickets.repository.interface';
import { ListTicketsRequest } from '../../presentation/dtos/requests/list-tickets.request';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';
import { UserRole } from '@/core/infrastructure/persistence/prisma/generated/enums';
import { TicketEntity } from '../../domain/entities/ticket.entity';

@Injectable()
export class ListTicketsUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.TicketsRepository)
    private readonly repository: ITicketsRepository,
  ) {}

  async execute(
    condominiumId: string,
    currentUser: AuthUserEntity,
    filters: ListTicketsRequest,
  ): Promise<{ tickets: TicketEntity[]; total: number; page: number; limit: number; totalPages: number }> {
    const isResident = currentUser.role === UserRole.RESIDENT;

    const queryFilters = {
      condominiumId,
      status: filters.status,
      category: filters.category,
      priority: filters.priority,
      scope: filters.scope,
      houseId: filters.houseId,
      assignedAdminId: filters.assignedAdminId,
      search: filters.search,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      creatorId: isResident ? currentUser.id : undefined,
    };

    const { tickets, total } = await this.repository.findMany(queryFilters);

    // Si es residente, ocultar comentarios internos de administración
    const sanitizedTickets = isResident
      ? tickets.map((t) => ({
          ...t,
          comments: t.comments?.filter((c) => !c.isInternal) ?? [],
        }))
      : tickets;

    const page = queryFilters.page;
    const limit = queryFilters.limit;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      tickets: sanitizedTickets,
      total,
      page,
      limit,
      totalPages,
    };
  }
}

