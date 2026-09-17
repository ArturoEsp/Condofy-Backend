import AccessLogsRepository, {
  ActiveEntryItemEntity,
} from '../../domain/repositories/access-logs.repository';

export class StandGetActiveEntriesUseCase {
  constructor(private readonly accessLogsRepository: AccessLogsRepository) {}

  async execute(
    condominiumId: string,
    search?: string,
  ): Promise<ActiveEntryItemEntity[]> {
    return await this.accessLogsRepository.findActiveEntries(
      condominiumId,
      search,
    );
  }
}
