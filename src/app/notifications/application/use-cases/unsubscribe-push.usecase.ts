import { Injectable } from '@nestjs/common';
import { PushSubscriptionsPrismaRepository } from '../../infrastructure/repositories/push-subscriptions.prisma.repository';

@Injectable()
export class UnsubscribePushUseCase {
  constructor(private readonly repository: PushSubscriptionsPrismaRepository) {}

  async execute(endpoint: string): Promise<{ success: boolean }> {
    await this.repository.deleteByEndpoint(endpoint);
    return { success: true };
  }
}
