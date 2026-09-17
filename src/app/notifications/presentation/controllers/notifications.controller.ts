import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';
import { SubscribePushRequest } from '../dto/requests/subscribe-push.request';
import { UnsubscribePushRequest } from '../dto/requests/unsubscribe-push.request';
import { SubscribePushUseCase } from '../../application/use-cases/subscribe-push.usecase';
import { UnsubscribePushUseCase } from '../../application/use-cases/unsubscribe-push.usecase';
import { WebPushService } from '../../infrastructure/services/web-push.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly subscribePushUseCase: SubscribePushUseCase,
    private readonly unsubscribePushUseCase: UnsubscribePushUseCase,
    private readonly webPushService: WebPushService,
  ) {}

  @Post('subscribe')
  async subscribe(
    @CurrentUser() user: AuthUserEntity,
    @Body() body: SubscribePushRequest,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.subscribePushUseCase.execute(user.id, body, userAgent);
  }

  @Post('unsubscribe')
  async unsubscribe(@Body() body: UnsubscribePushRequest) {
    return await this.unsubscribePushUseCase.execute(body.endpoint);
  }

  @Public()
  @Get('public-key')
  getPublicKey() {
    return {
      publicKey: this.webPushService.getPublicKey() || null,
    };
  }
}
