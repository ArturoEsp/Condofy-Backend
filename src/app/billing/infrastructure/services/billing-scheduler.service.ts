import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { BillingNotificationService } from './billing-notification.service';

@Injectable()
export class BillingSchedulerService {
  private readonly logger = new Logger(BillingSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: BillingNotificationService,
  ) {}

  /**
   * Cron Job del día 1 del mes (08:00 AM).
   * Notifica a los residentes activos de todos los condominios que tienen activa la apertura de cuota.
   */
  @Cron('0 8 1 * *')
  async handlePeriodStartCron(): Promise<void> {
    this.logger.log(
      'Iniciando Cron Job: Notificación de apertura de cuota mensual...',
    );
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const configs = await this.prisma.condominiumBillingConfig.findMany({
      where: { notifyOnPeriodStart: true },
    });

    for (const cfg of configs) {
      try {
        await this.notificationService.notifyPeriodStart(
          cfg.condominiumId,
          year,
          month,
        );
      } catch (err: unknown) {
        const error = err as Error;
        this.logger.error(
          `Error en Cron de apertura para condominio ${cfg.condominiumId}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Cron Job diario a las 09:00 AM.
   * Evalúa qué condominios tienen viviendas pendientes a punto de vencer (o el día del vencimiento).
   */
  @Cron('0 9 * * *')
  async handleDailyDueDateReminderCron(): Promise<void> {
    this.logger.log(
      'Iniciando Cron Job: Evaluación diaria de recordatorios de cobranza...',
    );

    const configs = await this.prisma.condominiumBillingConfig.findMany({
      where: { notifyDueDateReminder: true },
    });

    for (const cfg of configs) {
      try {
        await this.notificationService.notifyDueDateReminder(cfg.condominiumId);
      } catch (err: unknown) {
        const error = err as Error;
        this.logger.error(
          `Error en Cron de recordatorio para condominio ${cfg.condominiumId}: ${error.message}`,
        );
      }
    }
  }
}
