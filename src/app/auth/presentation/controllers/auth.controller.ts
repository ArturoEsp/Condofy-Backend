import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { LoginUseCase } from '../../application/use-cases/login.usecase';
import { LoginRequest } from '../../application/dto/requests/login.request';
import { Public } from '@/app/common/decorators/public.decorator';
import { MeUseCase } from '../../application/use-cases/me.usecase';
import { CurrentUser } from '@/app/common/decorators/current-user.decorator';
import { AuthUserEntity } from '../../domain/entities/auth-user.entity';
import { RefreshUseCase } from '../../application/use-cases/refresh-token.usecase';
import { ApiEndpoint } from '@/app/common/decorators/api-endpoint.decorator';

import * as AuthDocs from '../docs/auth.docs';
const isProduction = process.env.APP_ENV === 'production';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly meUseCase: MeUseCase,
  ) {}

  @Post('login')
  @Public()
  async login(
    @Body() dto: LoginRequest,
    @Req() req: Request,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const result = await this.loginUseCase.execute(
      {
        email: dto.email,
        password: dto.password,
      },
      req.ip,
      req.headers['user-agent'],
    );

    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: isProduction ? 'strict' : 'none',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: isProduction ? 'strict' : 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
    };
  }

  @Post('refresh-token')
  @Public()
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const refreshToken = req.cookies.refresh_token;

    const result = await this.refreshUseCase.execute(refreshToken);

    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: isProduction ? 'strict' : 'none',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: isProduction ? 'strict' : 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
    };
  }

  @Get('me')
  @ApiEndpoint(AuthDocs.authGetMe)
  async me(@CurrentUser() user: AuthUserEntity) {
    return await this.meUseCase.execute(user.id);
  }
}
