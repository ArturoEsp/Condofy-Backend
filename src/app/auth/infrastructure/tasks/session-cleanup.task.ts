import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import UserSessionRepository from '../../domain/repositories/user-session.repository';

@Injectable()
export class SessionCleanupTask {
  private readonly logger = new Logger(SessionCleanupTask.name);

  constructor(
    @Inject(PROVIDES_NAMES.UserSessionsRepository)
    private readonly userSessionRepository: UserSessionRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleCleanup(): Promise<void> {
    this.logger.log(
      '🧹 Iniciando limpieza automática de sesiones de usuario expiradas...',
    );
    try {
      const deletedCount =
        await this.userSessionRepository.deleteExpiredSessions();
      this.logger.log(
        `✅ Limpieza finalizada: ${deletedCount} sesiones expiradas/revocadas eliminadas.`,
      );
    } catch (error) {
      this.logger.error('❌ Error al eliminar sesiones expiradas:', error);
    }
  }
}
