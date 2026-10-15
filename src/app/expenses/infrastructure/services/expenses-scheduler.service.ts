import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExpensesNotificationService } from './expenses-notification.service';

@Injectable()
export class ExpensesSchedulerService {
  private readonly logger = new Logger(ExpensesSchedulerService.name);

  constructor(
    private readonly notificationService: ExpensesNotificationService,
  ) {}

  /**
   * Cron Job diario a las 09:00 AM.
   * Evalúa y envía notificaciones push a los administradores con egresos pendientes
   * programados para pagarse hoy.
   */
  @Cron('0 9 * * *')
  async handleDailyExpensesDueReminderCron(): Promise<void> {
    this.logger.log(
      'Iniciando Cron Job diario: Recordatorio de egresos pendientes programados para hoy...',
    );

    try {
      const summary =
        await this.notificationService.notifyPendingExpensesDueToday();
      this.logger.log(
        `Cron de egresos completado: ${summary.condominiumsNotified} condominios notificados, ${summary.totalExpensesNotified} egresos y ${summary.totalAdminsNotified} administradores alcanzados.`,
      );
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error en el cron job diario de egresos pendientes: ${error.message}`,
        error.stack,
      );
    }
  }
}
