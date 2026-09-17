import { Body, Controller, Get, Patch, Post, Put, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, CookieOptions } from 'express';
import { Throttle } from '@nestjs/throttler';

import { LoginUseCase } from '../../application/use-cases/login.usecase';
import { LoginRequest } from '../dto/requests/login.request';
import { MeUseCase } from '../../application/use-cases/me.usecase';
import { AuthUserEntity } from '../../domain/entities/auth-user.entity';
import { RefreshUseCase } from '../../application/use-cases/refresh-token.usecase';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.usecase';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.usecase';
import { UpdateProfileRequest } from '../dto/requests/update-profile.request';
import { ChangePasswordRequest } from '../dto/requests/change-password.request';

import * as AuthDocs from '../docs/auth.docs';
import { Public } from '@/common/decorators/public.decorator';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { LogoutUseCase } from '../../application/use-cases/logout.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly meUseCase: MeUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly configService: ConfigService,
  ) {}

  private getCookieOptions(maxAge?: number): CookieOptions {
    const isProduction =
      this.configService.get<string>('APP_ENV') === 'production' ||
      this.configService.get<string>('NODE_ENV') === 'production';

    const sameSiteEnv = this.configService.get<string>('COOKIE_SAME_SITE');
    const sameSite: boolean | 'lax' | 'strict' | 'none' =
      sameSiteEnv === 'none'
        ? 'none'
        : sameSiteEnv === 'strict'
          ? 'strict'
          : 'lax';

    const secureEnv = this.configService.get<string>('COOKIE_SECURE');
    const secure =
      secureEnv !== undefined ? secureEnv === 'true' : isProduction;

    const domain = this.configService.get<string>('COOKIE_DOMAIN') || undefined;

    return {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      ...(maxAge !== undefined ? { maxAge } : {}),
    };
  }

  @Post('login')
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
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

    response.cookie(
      'access_token',
      result.accessToken,
      this.getCookieOptions(15 * 60 * 1000),
    );

    response.cookie(
      'refresh_token',
      result.refreshToken,
      this.getCookieOptions(30 * 24 * 60 * 60 * 1000),
    );

    return {
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Post('refresh-token')
  @Public()
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const refreshToken =
      req.cookies?.refresh_token ||
      (req.headers['x-refresh-token'] as string | undefined);
    const result = await this.refreshUseCase.execute(refreshToken);

    response.cookie(
      'access_token',
      result.accessToken,
      this.getCookieOptions(15 * 60 * 1000),
    );

    response.cookie(
      'refresh_token',
      result.refreshToken,
      this.getCookieOptions(30 * 24 * 60 * 60 * 1000),
    );

    return {
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Post('logout')
  @Public()
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await this.logoutUseCase.execute(refreshToken);
    }

    const clearOptions = this.getCookieOptions();
    response.clearCookie('access_token', clearOptions);
    response.clearCookie('refresh_token', clearOptions);

    return { success: true };
  }

  @Get('me')
  @ApiEndpoint(AuthDocs.authGetMe)
  async me(@CurrentUser() user: AuthUserEntity) {
    return await this.meUseCase.execute(user.id);
  }

  @Patch('profile')
  @ApiEndpoint(AuthDocs.authUpdateProfile)
  async updateProfile(
    @CurrentUser() user: AuthUserEntity,
    @Body() dto: UpdateProfileRequest,
  ) {
    return await this.updateProfileUseCase.execute(user.id, dto);
  }

  @Put('change-password')
  @ApiEndpoint(AuthDocs.authChangePassword)
  async changePassword(
    @CurrentUser() user: AuthUserEntity,
    @Body() dto: ChangePasswordRequest,
  ) {
    return await this.changePasswordUseCase.execute(user.id, dto);
  }
}
