import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { SubscribePushRequest } from '../../presentation/dto/requests/subscribe-push.request';

@Injectable()
export class PushSubscriptionsPrismaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertSubscription(
    userId: string,
    data: SubscribePushRequest,
    userAgent?: string,
  ) {
    return await this.prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: {
        userId,
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        expirationTime: data.expirationTime
          ? BigInt(data.expirationTime)
          : null,
        userAgent: userAgent || null,
      },
      update: {
        userId,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        expirationTime: data.expirationTime
          ? BigInt(data.expirationTime)
          : null,
        userAgent: userAgent || null,
      },
    });
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });
  }

  async findByUserId(userId: string) {
    return await this.prisma.pushSubscription.findMany({
      where: { userId },
    });
  }

  async findByUserIds(userIds: string[]) {
    return await this.prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
    });
  }
}
