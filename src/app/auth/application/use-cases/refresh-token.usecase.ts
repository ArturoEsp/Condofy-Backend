import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import UserSessionRepository from '../../domain/repositories/user-session.repository';
import { JwtPayloadEntity } from '../../domain/entities/jwt-payload.entity';
import { EncryptionService } from '@/core/domain/services/encryption.service';

export class RefreshUseCase {
  constructor(
    private readonly sessionsRepository: UserSessionRepository,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload: JwtPayloadEntity;
    const refreshSecret =
      process.env.JWT_REFRESH_SECRET || process.env.APP_SECRET;

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
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

    const isValidRefresh = await this.encryptionService.compare(
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

    const newRefreshToken = await this.jwtService.signAsync(newPayload, {
      secret: refreshSecret,
      expiresIn: '30d',
    });

    const refreshTokenHash = await this.encryptionService.hash(newRefreshToken);

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
