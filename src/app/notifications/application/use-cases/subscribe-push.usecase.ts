import { Injectable } from '@nestjs/common';
import { PushSubscriptionsPrismaRepository } from '../../infrastructure/repositories/push-subscriptions.prisma.repository';
import { SubscribePushRequest } from '../../presentation/dto/requests/subscribe-push.request';

@Injectable()
export class SubscribePushUseCase {
  constructor(private readonly repository: PushSubscriptionsPrismaRepository) {}

  async execute(
    userId: string,
    data: SubscribePushRequest,
    userAgent?: string,
  ): Promise<{ success: boolean }> {
    await this.repository.upsertSubscription(userId, data, userAgent);
    return { success: true };
  }
}
