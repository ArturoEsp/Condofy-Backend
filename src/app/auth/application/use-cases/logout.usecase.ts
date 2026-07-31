import { JwtService } from '@nestjs/jwt';
import UserSessionRepository from '../../domain/repositories/user-session.repository';
import { JwtPayloadEntity } from '../../domain/entities/jwt-payload.entity';
import { UnauthorizedException } from '@nestjs/common';

export class LogoutUseCase {
  constructor(
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

    if (session) {
      await this.sessionsRepository.update({
        id: session.id,
        isRevoked: true,
      });
    }
  }
}
