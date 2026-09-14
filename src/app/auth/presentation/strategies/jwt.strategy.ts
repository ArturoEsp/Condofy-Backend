import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import UserSessionRepository from '../../domain/repositories/user-session.repository';
import { JwtPayloadEntity } from '../../domain/entities/jwt-payload.entity';
import { AuthUserEntity } from '../../domain/entities/auth-user.entity';

const SESSION_NOT_FOUND = 'Session not found';
const SESSION_REVOKED = 'Session revoked';
const SESSION_EXPIRED = 'Session expired';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(PROVIDES_NAMES.UserSessionsRepository)
    private readonly sessionsRepository: UserSessionRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.access_token,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('APP_SECRET'),
    });
  }

  async validate(payload: JwtPayloadEntity): Promise<AuthUserEntity> {
    const session = await this.sessionsRepository.findSessionWithUser(
      payload.sessionId,
    );

    if (!session) throw new UnauthorizedException(SESSION_NOT_FOUND);
    if (session.isRevoked) throw new UnauthorizedException(SESSION_REVOKED);
    if (session.expiresAt < new Date())
      throw new UnauthorizedException(SESSION_EXPIRED);

    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
      condominiumId: session.user.condominiumId || undefined,
      condominiumKey: session.user.condominiumKey || undefined,
    };
  }
}
