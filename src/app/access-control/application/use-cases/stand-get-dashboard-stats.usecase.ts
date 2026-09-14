import AccessLogsRepository, {
  StandDashboardStats,
} from '../../domain/repositories/access-logs.repository';

export class StandGetDashboardStatsUseCase {
  constructor(private readonly accessLogsRepository: AccessLogsRepository) {}

  async execute(condominiumId: string): Promise<StandDashboardStats> {
    return await this.accessLogsRepository.getDashboardStats(condominiumId);
  }
}
