import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';
import { UserRole } from '@/core/infrastructure/persistence/prisma/generated/enums';

import * as docs from '../docs/tickets.docs';
import { CreateTicketUseCase } from '../../application/use-cases/create-ticket.usecase';
import { ListTicketsUseCase } from '../../application/use-cases/list-tickets.usecase';
import { GetTicketByIdUseCase } from '../../application/use-cases/get-ticket-by-id.usecase';
import { UpdateTicketStatusUseCase } from '../../application/use-cases/update-ticket-status.usecase';
import { AssignTicketUseCase } from '../../application/use-cases/assign-ticket.usecase';
import { AddTicketCommentUseCase } from '../../application/use-cases/add-ticket-comment.usecase';
import { RateTicketUseCase } from '../../application/use-cases/rate-ticket.usecase';
import { GetTicketMetricsUseCase } from '../../application/use-cases/get-ticket-metrics.usecase';

import { CreateTicketRequest } from '../dtos/requests/create-ticket.request';
import { ListTicketsRequest } from '../dtos/requests/list-tickets.request';
import { UpdateTicketStatusRequest } from '../dtos/requests/update-ticket-status.request';
import { AssignTicketRequest } from '../dtos/requests/assign-ticket.request';
import { AddTicketCommentRequest } from '../dtos/requests/add-ticket-comment.request';
import { RateTicketRequest } from '../dtos/requests/rate-ticket.request';

@ApiTags('Tickets')
@Controller(':condominiumKey/tickets')
export class TicketsController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly listTicketsUseCase: ListTicketsUseCase,
    private readonly getTicketByIdUseCase: GetTicketByIdUseCase,
    private readonly updateTicketStatusUseCase: UpdateTicketStatusUseCase,
    private readonly assignTicketUseCase: AssignTicketUseCase,
    private readonly addTicketCommentUseCase: AddTicketCommentUseCase,
    private readonly rateTicketUseCase: RateTicketUseCase,
    private readonly getTicketMetricsUseCase: GetTicketMetricsUseCase,
  ) {}

  @Post()
  @ApiEndpoint(docs.createTicket)
  @Roles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SUPERADMIN)
  async createTicket(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() body: CreateTicketRequest,
  ) {
    return this.createTicketUseCase.execute(condominiumId, user.id, body);
  }

  @Get()
  @ApiEndpoint(docs.listTickets)
  @Roles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SUPERADMIN)
  async listTickets(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Query() query: ListTicketsRequest,
  ) {
    return this.listTicketsUseCase.execute(condominiumId, user, query);
  }

  @Get('metrics')
  @ApiEndpoint(docs.getTicketMetrics)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async getMetrics(@CondominiumId() condominiumId: string) {
    return this.getTicketMetricsUseCase.execute(condominiumId);
  }

  @Get(':id')
  @ApiEndpoint(docs.getTicketById)
  @Roles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SUPERADMIN)
  async getTicketById(
    @Param('id') id: string,
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
  ) {
    return this.getTicketByIdUseCase.execute(id, condominiumId, user);
  }

  @Patch(':id/status')
  @ApiEndpoint(docs.updateTicketStatus)
  @Roles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SUPERADMIN)
  async updateTicketStatus(
    @Param('id') id: string,
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() body: UpdateTicketStatusRequest,
  ) {
    return this.updateTicketStatusUseCase.execute(id, condominiumId, user, body);
  }

  @Patch(':id/assign')
  @ApiEndpoint(docs.assignTicket)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async assignTicket(
    @Param('id') id: string,
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() body: AssignTicketRequest,
  ) {
    return this.assignTicketUseCase.execute(id, condominiumId, user.id, body);
  }

  @Post(':id/comments')
  @ApiEndpoint(docs.addTicketComment)
  @Roles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SUPERADMIN)
  async addComment(
    @Param('id') id: string,
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() body: AddTicketCommentRequest,
  ) {
    return this.addTicketCommentUseCase.execute(id, condominiumId, user, body);
  }

  @Post(':id/rate')
  @ApiEndpoint(docs.rateTicket)
  @Roles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SUPERADMIN)
  async rateTicket(
    @Param('id') id: string,
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() body: RateTicketRequest,
  ) {
    return this.rateTicketUseCase.execute(id, condominiumId, user, body);
  }
}

