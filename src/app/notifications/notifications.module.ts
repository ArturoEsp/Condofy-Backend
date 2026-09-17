import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/infrastructure/persistence/prisma/prisma.module';
import { NotificationsController } from './presentation/controllers/notifications.controller';
import { PushSubscriptionsPrismaRepository } from './infrastructure/repositories/push-subscriptions.prisma.repository';
import { WebPushService } from './infrastructure/services/web-push.service';
import { SubscribePushUseCase } from './application/use-cases/subscribe-push.usecase';
import { UnsubscribePushUseCase } from './application/use-cases/unsubscribe-push.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [
    PushSubscriptionsPrismaRepository,
    WebPushService,
    SubscribePushUseCase,
    UnsubscribePushUseCase,
  ],
  exports: [WebPushService, PushSubscriptionsPrismaRepository],
})
export class NotificationsModule {}
