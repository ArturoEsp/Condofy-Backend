import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { ITicketsRepository } from '../../domain/repositories/tickets.repository.interface';
import { TicketMetricsResponse } from '../../presentation/dtos/responses/ticket-metrics.response';

@Injectable()
export class GetTicketMetricsUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.TicketsRepository)
    private readonly repository: ITicketsRepository,
  ) {}

  async execute(condominiumId: string): Promise<TicketMetricsResponse> {
    return this.repository.getMetrics(condominiumId);
  }
}

