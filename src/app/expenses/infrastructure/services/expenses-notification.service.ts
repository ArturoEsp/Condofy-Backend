import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';
import {
  ExpenseStatus,
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/client';

export interface PendingExpensesNotificationSummary {
  date: string;
  condominiumsChecked: number;
  condominiumsNotified: number;
  totalExpensesNotified: number;
  totalAdminsNotified: number;
  results: Array<{
    condominiumId: string;
    condominiumName: string;
    expensesCount: number;
    totalAmount: number;
    adminsNotifiedCount: number;
  }>;
}

@Injectable()
export class ExpensesNotificationService {
  private readonly logger = new Logger(ExpensesNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webPushService: WebPushService,
  ) {}

  /**
   * Obtiene la fecha en formato YYYY-MM-DD en la zona horaria de México (America/Mexico_City).
   */
  getTodayDateString(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  /**
   * Evalúa y envía notificaciones push a los administradores de condominios
   * cuyos egresos tengan estatus PENDING y fecha de pago programada para hoy.
   *
   * @param specificCondominiumId (Opcional) Si se proporciona, solo procesa este condominio.
   */
  async notifyPendingExpensesDueToday(
    specificCondominiumId?: string,
  ): Promise<PendingExpensesNotificationSummary> {
    const todayStr = this.getTodayDateString();
    this.logger.log(
      `Iniciando evaluación de recordatorios de egresos pendientes para la fecha ${todayStr}...`,
    );

    // Calculamos una ventana amplia para cubrir UTC y posibles desfases de zona horaria (UTC-6)
    const baseDate = new Date(`${todayStr}T12:00:00.000Z`);
    const windowStart = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000);
    const windowEnd = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);

    const condoWhere: Record<string, unknown> = { isDisabled: false };
    if (specificCondominiumId) {
      condoWhere.id = specificCondominiumId;
    }

    const condominiums = await this.prisma.condominium.findMany({
      where: condoWhere,
      select: {
        id: true,
        key: true,
        name: true,
      },
    });

    const summary: PendingExpensesNotificationSummary = {
      date: todayStr,
      condominiumsChecked: condominiums.length,
      condominiumsNotified: 0,
      totalExpensesNotified: 0,
      totalAdminsNotified: 0,
      results: [],
    };

    for (const condo of condominiums) {
      try {
        // Buscar egresos en estado PENDING dentro de la ventana de fechas
        const candidateExpenses = await this.prisma.expense.findMany({
          where: {
            condominiumId: condo.id,
            status: ExpenseStatus.PENDING,
            expenseDate: {
              gte: windowStart,
              lte: windowEnd,
            },
          },
          include: {
            createdBy: {
              select: { id: true, role: true, status: true },
            },
          },
          orderBy: { expenseDate: 'asc' },
        });

        // Filtrar con precisión que la fecha de pago (local o UTC) sea todayStr
        const dueExpensesToday = candidateExpenses.filter((expense) => {
          const localStr = this.getTodayDateString(expense.expenseDate);
          const utcStr = expense.expenseDate.toISOString().slice(0, 10);
          return localStr === todayStr || utcStr === todayStr;
        });

        if (dueExpensesToday.length === 0) {
          continue;
        }

        // Buscar los administradores activos del condominio
        const adminUsers = await this.prisma.user.findMany({
          where: {
            condominiumId: condo.id,
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
          },
          select: { id: true, email: true },
        });

        const targetUserIds = new Set<string>(adminUsers.map((a) => a.id));

        // Si el usuario creador del gasto es administrador o superadmin activo, incluirlo
        for (const exp of dueExpensesToday) {
          if (
            exp.createdBy &&
            (exp.createdBy.role === UserRole.ADMIN ||
              exp.createdBy.role === UserRole.SUPERADMIN) &&
            exp.createdBy.status === UserStatus.ACTIVE
          ) {
            targetUserIds.add(exp.createdBy.id);
          }
        }

        const adminIdsArray = Array.from(targetUserIds);
        if (adminIdsArray.length === 0) {
          this.logger.warn(
            `El condominio "${condo.name}" (${condo.id}) tiene ${dueExpensesToday.length} egresos para hoy, pero no cuenta con administradores activos con cuenta habilitada.`,
          );
          continue;
        }

        const totalAmount = dueExpensesToday.reduce(
          (sum, e) => sum + Number(e.amount),
          0,
        );
        const totalAmountFormatted = totalAmount.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        // Construir el mensaje de notificación
        let title: string;
        let body: string;
        const tag = `expense-reminder-${condo.id}-${todayStr}`;

        if (dueExpensesToday.length === 1) {
          const exp = dueExpensesToday[0];
          const amountFormatted = Number(exp.amount).toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          const supplierInfo = exp.supplier ? ` a ${exp.supplier}` : '';

          title = `Recordatorio de Egreso Programado 🔔`;
          body = `Hoy es la fecha de pago de "${exp.concept}" por $${amountFormatted} MXN${supplierInfo}.`;
        } else {
          title = `Recordatorio: ${dueExpensesToday.length} Egresos para Hoy 🔔`;
          body = `Tienes ${dueExpensesToday.length} pagos de egresos programados para hoy por un total de $${totalAmountFormatted} MXN.`;
        }

        const payload = {
          title,
          body,
          icon: '/android/launchericon-192x192.png',
          badge: '/ios/72.png',
          url: '/admin/egresos?status=PENDING',
          tag,
          data: {
            type: 'EXPENSE_DUE_REMINDER',
            condominiumId: condo.id,
            condominiumKey: condo.key,
            count: dueExpensesToday.length,
            totalAmount,
            date: todayStr,
          },
        };

        await this.webPushService.sendNotificationToUsers(
          adminIdsArray,
          payload,
        );

        summary.condominiumsNotified += 1;
        summary.totalExpensesNotified += dueExpensesToday.length;
        summary.totalAdminsNotified += adminIdsArray.length;
        summary.results.push({
          condominiumId: condo.id,
          condominiumName: condo.name,
          expensesCount: dueExpensesToday.length,
          totalAmount,
          adminsNotifiedCount: adminIdsArray.length,
        });

        this.logger.log(
          `Recordatorio Push enviado a ${adminIdsArray.length} admin(s) de "${condo.name}" para ${dueExpensesToday.length} egreso(s) por $${totalAmountFormatted} MXN.`,
        );
      } catch (err: unknown) {
        const error = err as Error;
        this.logger.error(
          `Error enviando recordatorio de egresos para condominio ${condo.id}: ${error.message}`,
          error.stack,
        );
      }
    }

    return summary;
  }
}
