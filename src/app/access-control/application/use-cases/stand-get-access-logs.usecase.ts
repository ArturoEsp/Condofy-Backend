import AccessLogsRepository, {
  ParamsFindAccessLogs,
  StandAccessLogsResult,
} from '../../domain/repositories/access-logs.repository';

export class StandGetAccessLogsUseCase {
  constructor(private readonly accessLogsRepository: AccessLogsRepository) {}

  async execute(params: ParamsFindAccessLogs): Promise<StandAccessLogsResult> {
    return await this.accessLogsRepository.findTodayLogs(params);
  }
}
