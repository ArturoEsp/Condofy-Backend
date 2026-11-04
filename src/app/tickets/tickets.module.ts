import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/infrastructure/persistence/prisma/prisma.module';
import { CoreModule } from '@/core/core.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';

import { TicketsPrismaRepository } from './infrastructure/repositories/tickets.prisma.repository';
import { TicketsController } from './presentation/controllers/tickets.controller';

import { CreateTicketUseCase } from './application/use-cases/create-ticket.usecase';
import { ListTicketsUseCase } from './application/use-cases/list-tickets.usecase';
import { GetTicketByIdUseCase } from './application/use-cases/get-ticket-by-id.usecase';
import { UpdateTicketStatusUseCase } from './application/use-cases/update-ticket-status.usecase';
import { AssignTicketUseCase } from './application/use-cases/assign-ticket.usecase';
import { AddTicketCommentUseCase } from './application/use-cases/add-ticket-comment.usecase';
import { RateTicketUseCase } from './application/use-cases/rate-ticket.usecase';
import { GetTicketMetricsUseCase } from './application/use-cases/get-ticket-metrics.usecase';

@Module({
  imports: [PrismaModule, CoreModule, NotificationsModule],
  controllers: [TicketsController],
  providers: [
    {
      provide: PROVIDES_NAMES.TicketsRepository,
      useClass: TicketsPrismaRepository,
    },
    CreateTicketUseCase,
    ListTicketsUseCase,
    GetTicketByIdUseCase,
    UpdateTicketStatusUseCase,
    AssignTicketUseCase,
    AddTicketCommentUseCase,
    RateTicketUseCase,
    GetTicketMetricsUseCase,
  ],
  exports: [PROVIDES_NAMES.TicketsRepository],
})
export class TicketsModule {}

