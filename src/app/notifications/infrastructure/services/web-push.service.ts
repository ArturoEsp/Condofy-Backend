import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PushSubscriptionsPrismaRepository } from '../repositories/push-subscriptions.prisma.repository';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class WebPushService implements OnModuleInit {
  private readonly logger = new Logger(WebPushService.name);
  private isConfigured = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly repository: PushSubscriptionsPrismaRepository,
  ) {}

  onModuleInit() {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject =
      this.configService.get<string>('VAPID_SUBJECT') ||
      'mailto:contacto@condofy.com.mx';

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.isConfigured = true;
      this.logger.log('WebPush VAPID configurado exitosamente.');
    } else {
      this.logger.warn(
        'VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY no están configuradas en el entorno. Las notificaciones Web Push estarán desactivadas.',
      );
    }
  }

  getPublicKey(): string | undefined {
    return this.configService.get<string>('VAPID_PUBLIC_KEY');
  }

  /**
   * Envía una notificación push a todos los dispositivos registrados de un usuario.
   */
  async sendNotificationToUser(
    userId: string,
    payload: PushNotificationPayload,
  ): Promise<void> {
    if (!this.isConfigured) {
      this.logger.debug(
        `Push no enviado a ${userId}: VAPID no está configurado.`,
      );
      return;
    }

    const subscriptions = await this.repository.findByUserId(userId);
    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    const notificationData = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/android/launchericon-192x192.png',
      badge: payload.badge || '/ios/72.png',
      url: payload.url || '/',
      tag: payload.tag || 'condofy-alert',
      ...payload.data,
    });

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, notificationData);
      } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusCode = (error as any)?.statusCode;
        // 410 (Gone) o 404 (Not Found) indican que el dispositivo revocó el permiso o desinstaló
        if (statusCode === 410 || statusCode === 404) {
          this.logger.log(
            `Suscripción expirada para el endpoint: ${sub.endpoint}. Eliminando de la BD.`,
          );
          await this.repository.deleteByEndpoint(sub.endpoint);
        } else {
          this.logger.error(
            `Error al enviar Web Push a ${sub.endpoint}:`,
            error,
          );
        }
      }
    });

    await Promise.allSettled(sendPromises);
  }

  /**
   * Envía una notificación push a una lista de usuarios (ej. miembros de una casa o guardias).
   */
  async sendNotificationToUsers(
    userIds: string[],
    payload: PushNotificationPayload,
  ): Promise<void> {
    if (!userIds.length) return;
    await Promise.allSettled(
      userIds.map((id) => this.sendNotificationToUser(id, payload)),
    );
  }
}
