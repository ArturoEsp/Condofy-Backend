import { Inject, Injectable, Logger } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import {
  AnnouncementsRepository,
  CreateAnnouncementData,
} from '../../domain/repositories/announcements.repository';
import { AnnouncementEntity } from '../../domain/entities/announcement.entity';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class CreateAnnouncementUseCase {
  private readonly logger = new Logger(CreateAnnouncementUseCase.name);

  constructor(
    @Inject(PROVIDES_NAMES.AnnouncementsRepository)
    private readonly repository: AnnouncementsRepository,
    private readonly prisma: PrismaService,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(data: CreateAnnouncementData): Promise<AnnouncementEntity> {
    const announcement = await this.repository.create(data);

    // Enviar notificación Push en segundo plano a los residentes del condominio
    if (announcement.isActive) {
      this.sendPushNotification(announcement).catch((err) => {
        this.logger.error(
          'Error enviando notificación Push de comunicado:',
          err,
        );
      });
    }

    return announcement;
  }

  private async sendPushNotification(announcement: AnnouncementEntity) {
    try {
      const residents = await this.prisma.residentProfile.findMany({
        where: { condominiumId: announcement.condominiumId },
        select: { userId: true },
      });

      const userIds = residents
        .map((r) => r.userId)
        .filter((id): id is string => Boolean(id));

      if (userIds.length === 0) return;

      const prefix =
        announcement.priority === 'URGENT'
          ? '🚨 ¡Alerta Urgente!'
          : announcement.priority === 'IMPORTANT'
            ? '⚠️ Aviso Importante'
            : '📢 Nuevo Comunicado';

      await this.webPushService.sendNotificationToUsers(userIds, {
        title: `${prefix}: ${announcement.title}`,
        body: announcement.previewMessage,
        url: '/residente/dashboard',
        tag: `announcement-${announcement.id}`,
        data: {
          announcementId: announcement.id,
          priority: announcement.priority,
        },
      });
    } catch (err) {
      this.logger.warn(
        `No se pudo enviar notificación push para el comunicado ${announcement.id}: ${err}`,
      );
    }
  }
}
