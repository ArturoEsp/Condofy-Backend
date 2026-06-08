import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import UserSessionRepository from '../../domain/repositories/user-session.repository';
import { PROVIDES_NAMES } from '@/app/common/enums/provides-names.enums';
import { JwtPayloadEntity } from '../../domain/entities/jwt-payload.entity';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.UserSessionsRepository)
    private readonly sessionsRepository: UserSessionRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(refreshToken: string) {
    let payload: JwtPayloadEntity;

    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.sessionsRepository.findById(payload.sessionId);

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.isRevoked) {
      throw new UnauthorizedException('Session revoked');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    const isValidRefresh = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isValidRefresh) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    const newPayload: JwtPayloadEntity = {
      sub: payload.sub,
      role: payload.role,
      sessionId: session.id,
    };

    const accessToken = await this.jwtService.signAsync(newPayload, {
      expiresIn: '15m',
    });

    const newRefreshTokenPayload: JwtPayloadEntity = {
      sub: payload.sub,
      role: payload.role,
      sessionId: session.id,
    };

    const newRefreshToken = await this.jwtService.signAsync(
      newRefreshTokenPayload,
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '30d',
      },
    );

    const refreshTokenHash = await bcrypt.hash(newRefreshToken, 12);

    await this.sessionsRepository.update({
      id: session.id,
      refreshTokenHash,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
