import AccessAuthorizationsRepository from '../../domain/repositories/access-authorizations.repository';
import AccessLogsRepository, {
  AccessLogItemEntity,
} from '../../domain/repositories/access-logs.repository';
import { EntryType } from '@/core/infrastructure/persistence/prisma/generated/enums';

export interface StandBatchExitCommand {
  condominiumId: string;
  accessAuthorizationIds: string[];
  observations?: string;
  userAcceptId: string;
}

export interface StandBatchExitResult {
  success: boolean;
  processedCount: number;
  logs: AccessLogItemEntity[];
}

export class StandBatchExitUseCase {
  constructor(
    private readonly accessAuthorizationsRepository: AccessAuthorizationsRepository,
    private readonly accessLogsRepository: AccessLogsRepository,
  ) {}

  async execute(command: StandBatchExitCommand): Promise<StandBatchExitResult> {
    const uniqueIds = Array.from(new Set(command.accessAuthorizationIds));
    const createdLogs: AccessLogItemEntity[] = [];

    for (const authId of uniqueIds) {
      const pass =
        await this.accessAuthorizationsRepository.findOneById(authId);

      if (!pass) {
        continue;
      }

      if (
        pass.condominium?.id &&
        pass.condominium.id !== command.condominiumId
      ) {
        continue;
      }

      const log = await this.accessLogsRepository.create({
        accessAuthorizationId: authId,
        entryType: EntryType.EXIT,
        observations: command.observations,
        userAcceptId: command.userAcceptId,
      });

      createdLogs.push(log);
    }

    return {
      success: true,
      processedCount: createdLogs.length,
      logs: createdLogs,
    };
  }
}
