import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { LoginRequest } from '../dto/requests/login.request';
import { LoginResponse } from '../dto/responses/login.response';
import { PROVIDES_NAMES } from '@/app/common/enums/provides-names.enums';
import UsersRepository from '@/app/users/domain/repositories/users.repository';
import { JwtService } from '@nestjs/jwt';
import UserSessionRepository from '../../domain/repositories/user-session.repository';

const INVALID_CREDENTIALS_MESSAGE = 'Credenciales invalidas.';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.UsersRepository)
    private readonly usersRepository: UsersRepository,
    @Inject(PROVIDES_NAMES.UserSessionsRepository)
    private readonly sessionsRepository: UserSessionRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    dto: LoginRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponse> {
    const user = await this.usersRepository.findOneByEmail(dto.email);

    if (!user) {
      throw new BadRequestException(INVALID_CREDENTIALS_MESSAGE);
    }

    const isValidPassword = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new BadRequestException(INVALID_CREDENTIALS_MESSAGE);
    }

    const session = await this.sessionsRepository.create({
      userId: user.id,
      ip: ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isRevoked: false,
      refreshTokenHash: '',
    });

    const payload = {
      sub: user.id,
      role: user.role,
      sessionId: session.id,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.sessionsRepository.update({
      id: session.id,
      refreshTokenHash,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
