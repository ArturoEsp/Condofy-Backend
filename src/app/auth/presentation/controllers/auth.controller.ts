import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { LoginUseCase } from '../../application/use-cases/login.usecase';
import { LoginRequest } from '../dto/requests/login.request';
import { MeUseCase } from '../../application/use-cases/me.usecase';
import { AuthUserEntity } from '../../domain/entities/auth-user.entity';
import { RefreshUseCase } from '../../application/use-cases/refresh-token.usecase';

import * as AuthDocs from '../docs/auth.docs';
import { Public } from '@/common/decorators/public.decorator';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { LogoutUseCase } from '../../application/use-cases/logout.usecase';

const isProduction = process.env.APP_ENV === 'production';
const sameSite = isProduction ? 'strict' : 'none';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly meUseCase: MeUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('login')
  @Public()
  async login(
    @Body() dto: LoginRequest,
    @Req() req: Request,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const result = await this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite,
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { success: true };
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
      sameSite,
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
    };
  }
  @Post('logout')
  @Public()
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      await this.logoutUseCase.execute(refreshToken);
    }

    response.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite,
    });
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite,
    });

    return { success: true };
  }

  @Get('me')
  @ApiEndpoint(AuthDocs.authGetMe)
  async me(@CurrentUser() user: AuthUserEntity) {
    return await this.meUseCase.execute(user.id);
  }
}
