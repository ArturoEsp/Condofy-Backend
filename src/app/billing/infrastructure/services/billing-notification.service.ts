import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { MailService } from '@/core/domain/services/mail.service';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export interface NotifyProofReviewedParams {
  condominiumId: string;
  chargeId: string;
  action: 'APPROVE' | 'REJECT';
  rejectReason?: string;
  receiptFolio?: string;
}

export interface ManualReminderResult {
  notifiedCount: number;
  period: string;
}

@Injectable()
export class BillingNotificationService {
  private readonly logger = new Logger(BillingNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webPushService: WebPushService,
    @Inject(PROVIDES_NAMES.MailService)
    private readonly mailService: MailService,
  ) {}

  /**
   * Notificación inmediata al residente cuando su comprobante es aprobado o rechazado por administración.
   */
  async notifyProofReviewed(params: NotifyProofReviewedParams): Promise<void> {
    const { condominiumId, chargeId, action, rejectReason, receiptFolio } =
      params;

    try {
      const config = await this.prisma.condominiumBillingConfig.findUnique({
        where: { condominiumId },
      });

      if (config && config.notifyOnProofReviewed === false) {
        this.logger.debug(
          `Notificación de revisión omitida: notifyOnProofReviewed está desactivado para el condominio ${condominiumId}`,
        );
        return;
      }

      const channel = config?.notificationChannel || 'ALL';

      const charge = await this.prisma.maintenanceCharge.findUnique({
        where: { id: chargeId },
        include: {
          house: {
            include: {
              residents: {
                include: { user: true },
              },
            },
          },
          condominium: true,
          maintenancePeriod: true,
        },
      });

      if (!charge) return;

      const condominiumName = charge.condominium.name;
      const houseNumber = charge.house.houseNumber;
      const periodName =
        charge.maintenancePeriod?.name ||
        `Periodo ${charge.dueDate.getMonth() + 1}/${charge.dueDate.getFullYear()}`;
      const residentProfiles = charge.house.residents || [];

      for (const resident of residentProfiles) {
        const user = resident.user;
        if (!user) continue;

        const recipientName =
          `${resident.firstName || ''} ${resident.lastName || ''}`.trim() ||
          user.email;

        if (action === 'APPROVE') {
          const folio = receiptFolio || 'Oficial';

          // 1. Web Push
          if (channel === 'ALL' || channel === 'PUSH') {
            await this.webPushService.sendNotificationToUser(user.id, {
              title: `¡Pago Acreditado! Recibo emitido 🎉`,
              body: `Tu cuota de ${periodName} para ${houseNumber} fue aprobada. Folio: ${folio}`,
              url: '/resident/payments',
              tag: `billing-approve-${chargeId}`,
            });
          }

          // 2. Email
          if (channel === 'ALL' || channel === 'EMAIL') {
            await this.mailService.sendNotificationEmail({
              to: user.email,
              recipientName,
              condominiumName,
              subject: `¡Pago Acreditado! Recibo ${folio}`,
              title: `Tu pago de mantenimiento ha sido validado exitosamente`,
              message: `Administración ha cotejado tu comprobante para la vivienda ${houseNumber} y tu pago quedó debidamente registrado en el sistema.`,
              details: [
                { label: 'Vivienda', value: houseNumber },
                { label: 'Concepto', value: charge.concept },
                { label: 'Folio Recibo', value: folio },
                {
                  label: 'Importe Pagado',
                  value: `$${Number(charge.paidAmount || charge.amount).toLocaleString('es-MX')} ${config?.currency || 'MXN'}`,
                },
              ],
              actionText: 'Ver Mi Recibo Oficial',
              actionUrl: 'https://app.condofy.com.mx/resident/payments',
            });
          }
        } else {
          // REJECT
          const reason =
            rejectReason || 'No coincide con el estado de cuenta bancario';

          // 1. Web Push
          if (channel === 'ALL' || channel === 'PUSH') {
            await this.webPushService.sendNotificationToUser(user.id, {
              title: `Comprobante de Pago Rechazado ⚠️`,
              body: `El comprobante para ${houseNumber} no fue aprobado: ${reason}`,
              url: '/resident/payments',
              tag: `billing-reject-${chargeId}`,
            });
          }

          // 2. Email
          if (channel === 'ALL' || channel === 'EMAIL') {
            await this.mailService.sendNotificationEmail({
              to: user.email,
              recipientName,
              condominiumName,
              subject: `Atención: Comprobante de pago rechazado`,
              title: `Tu comprobante de pago requiere atención`,
              message: `Administración revisó el comprobante adjunto para la vivienda ${houseNumber} pero no pudo ser validado.`,
              details: [
                { label: 'Vivienda', value: houseNumber },
                { label: 'Periodo', value: periodName },
                { label: 'Motivo de Rechazo', value: reason },
              ],
              actionText: 'Subir Comprobante Corregido',
              actionUrl: 'https://app.condofy.com.mx/resident/payments',
            });
          }
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error al enviar notificación de comprobante para cargo ${chargeId}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Notificación masiva al iniciar el mes (Apertura de Cuota de Mantenimiento).
   */
  async notifyPeriodStart(
    condominiumId: string,
    year: number,
    month: number,
  ): Promise<number> {
    try {
      const config = await this.prisma.condominiumBillingConfig.findUnique({
        where: { condominiumId },
      });

      if (config && config.notifyOnPeriodStart === false) {
        return 0;
      }

      const channel = config?.notificationChannel || 'ALL';
      const monthName = MONTH_NAMES[month - 1] || `Mes ${month}`;
      const periodName = `${monthName} ${year}`;
      const monthlyFee = Number(config?.defaultMonthlyFee || 1500);
      const dueDay = config?.dueDay || 10;
      const currency = config?.currency || 'MXN';

      const condominium = await this.prisma.condominium.findUnique({
        where: { id: condominiumId },
      });

      if (!condominium) return 0;

      // Obtener todos los residentes activos
      const residents = await this.prisma.residentProfile.findMany({
        where: { condominiumId },
        include: { user: true, house: true },
      });

      let count = 0;
      for (const res of residents) {
        if (!res.user) continue;

        const recipientName =
          `${res.firstName || ''} ${res.lastName || ''}`.trim() ||
          res.user.email;
        const houseStr = res.house?.houseNumber || 'tu vivienda';

        // 1. Push
        if (channel === 'ALL' || channel === 'PUSH') {
          await this.webPushService.sendNotificationToUser(res.user.id, {
            title: `Cuota de Mantenimiento - ${periodName} 📅`,
            body: `Tu cuota de ${monthName} ya está disponible ($${monthlyFee.toLocaleString('es-MX')} ${currency}). Fecha límite: Día ${dueDay}.`,
            url: '/resident/payments',
            tag: `period-start-${year}-${month}`,
          });
        }

        // 2. Email
        if (channel === 'ALL' || channel === 'EMAIL') {
          await this.mailService.sendNotificationEmail({
            to: res.user.email,
            recipientName,
            condominiumName: condominium.name,
            subject: `Cuota de Mantenimiento Publicada - ${periodName}`,
            title: `Se ha publicado la cuota de mantenimiento de ${periodName}`,
            message: `Estimado habitante de ${houseStr}, te informamos que ya se encuentra habilitado el periodo de mantenimiento de ${monthName}.`,
            details: [
              { label: 'Periodo', value: periodName },
              {
                label: 'Importe Ordinario',
                value: `$${monthlyFee.toLocaleString('es-MX')} ${currency}`,
              },
              {
                label: 'Fecha Límite Ordinaria',
                value: `Día ${dueDay} de ${monthName} de ${year}`,
              },
            ],
            actionText: 'Consultar y Pagar Cuota',
            actionUrl: 'https://app.condofy.com.mx/resident/payments',
          });
        }

        count++;
      }

      this.logger.log(
        `Notificaciones de inicio de periodo enviadas a ${count} residentes en ${condominium.name}`,
      );
      return count;
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error al notificar inicio de periodo en ${condominiumId}: ${error.message}`,
        error.stack,
      );
      return 0;
    }
  }

  /**
   * Notificación preventiva de corte (X días antes del dueDay o el día del vencimiento).
   */
  async notifyDueDateReminder(condominiumId: string): Promise<number> {
    try {
      const config = await this.prisma.condominiumBillingConfig.findUnique({
        where: { condominiumId },
      });

      if (config && config.notifyDueDateReminder === false) {
        return 0;
      }

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const dueDay = config?.dueDay || 10;
      const daysBefore = config?.dueDateReminderDaysBefore || 3;
      const targetReminderDay = dueDay - daysBefore;
      const todayDay = now.getDate();

      // Verificar si hoy corresponde enviar recordatorio (el día configurado o el día límite)
      const isReminderDay =
        todayDay === targetReminderDay || todayDay === dueDay;
      if (!isReminderDay) {
        return 0;
      }

      return await this.sendManualReminderToPending(
        condominiumId,
        `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
      ).then((r) => r.notifiedCount);
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error al procesar recordatorio preventivo en ${condominiumId}: ${error.message}`,
      );
      return 0;
    }
  }

  /**
   * Envío de recordatorio masivo a todas las viviendas con adeudo PENDING del periodo.
   * Puede ser disparado por el cron diario o manualmente por el administrador.
   */
  async sendManualReminderToPending(
    condominiumId: string,
    periodStr?: string,
  ): Promise<ManualReminderResult> {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;

    if (periodStr && periodStr.includes('-')) {
      const [y, m] = periodStr.split('-').map(Number);
      year = y;
      month = m;
    }

    const monthName = MONTH_NAMES[month - 1] || `Mes ${month}`;
    const periodName = `${monthName} ${year}`;

    const config = await this.prisma.condominiumBillingConfig.findUnique({
      where: { condominiumId },
    });

    const channel = config?.notificationChannel || 'ALL';
    const dueDay = config?.dueDay || 10;
    const currency = config?.currency || 'MXN';

    const condominium = await this.prisma.condominium.findUnique({
      where: { id: condominiumId },
    });

    if (!condominium) return { notifiedCount: 0, period: `${year}-${month}` };

    // Buscar cargos en estado PENDING para este periodo
    const pendingCharges = await this.prisma.maintenanceCharge.findMany({
      where: {
        condominiumId,
        maintenancePeriod: {
          year,
          month,
        },
        status: 'PENDING',
      },
      include: {
        house: {
          include: {
            residents: {
              include: { user: true },
            },
          },
        },
      },
    });

    let notifiedCount = 0;

    for (const charge of pendingCharges) {
      const residents = charge.house.residents || [];
      const houseNumber = charge.house.houseNumber;
      const amount = Number(charge.amount);

      for (const res of residents) {
        if (!res.user) continue;

        const recipientName =
          `${res.firstName || ''} ${res.lastName || ''}`.trim() ||
          res.user.email;

        // 1. Push
        if (channel === 'ALL' || channel === 'PUSH') {
          await this.webPushService.sendNotificationToUser(res.user.id, {
            title: `Recordatorio de Pago - ${periodName} ⏳`,
            body: `Tu cuota de ${houseNumber} vence pronto. Paga antes del día ${dueDay} para evitar recargo por mora.`,
            url: '/resident/payments',
            tag: `reminder-${charge.id}`,
          });
        }

        // 2. Email
        if (channel === 'ALL' || channel === 'EMAIL') {
          await this.mailService.sendNotificationEmail({
            to: res.user.email,
            recipientName,
            condominiumName: condominium.name,
            subject: `Recordatorio: Cuota de Mantenimiento ${periodName}`,
            title: `Recordatorio de cuota de mantenimiento pendiente`,
            message: `Estimado habitante de ${houseNumber}, te recordamos que tu cuota de mantenimiento de ${periodName} está pendiente de pago.`,
            details: [
              { label: 'Vivienda', value: houseNumber },
              { label: 'Periodo', value: periodName },
              {
                label: 'Importe Pendiente',
                value: `$${amount.toLocaleString('es-MX')} ${currency}`,
              },
              {
                label: 'Fecha Límite Ordinaria',
                value: `Día ${dueDay} de ${monthName}`,
              },
            ],
            actionText: 'Reportar Mi Pago Ahora',
            actionUrl: 'https://app.condofy.com.mx/resident/payments',
          });
        }

        notifiedCount++;
      }
    }

    this.logger.log(
      `Recordatorio de cobranza enviado a ${notifiedCount} residentes con adeudo en ${condominium.name}`,
    );

    return {
      notifiedCount,
      period: `${year}-${String(month).padStart(2, '0')}`,
    };
  }
}
