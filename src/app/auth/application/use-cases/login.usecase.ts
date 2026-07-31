import UsersRepository from '@/app/users/domain/repositories/users.repository';
import { JwtService } from '@nestjs/jwt';

import UserSessionRepository from '../../domain/repositories/user-session.repository';
import { EncryptionService } from '@/core/domain/services/encryptation.service';
import { InvalidCredentialsException } from '../errors/invalid-credentials.exception';
import { LoginCommand } from '../commands/login.command';
import CondominiumsRepository from '@/app/condominiums/domain/repositories/condominiums.repository';
import { FatalErrorException } from '@/common/errors/fatal-message.error';
import { SuspendedAccountException } from '../errors/suspended-account.exception';

export class LoginUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sessionsRepository: UserSessionRepository,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
    private readonly condominiumsRepository: CondominiumsRepository,
  ) {}

  async execute(dto: LoginCommand) {
    const user = await this.usersRepository.findOneByEmail(dto.email);

    if (!user) throw new InvalidCredentialsException();

    const isValidPassword = await this.encryptionService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isValidPassword) throw new InvalidCredentialsException();
    if (user.status === 'SUSPENDED') throw new SuspendedAccountException();

    try {
      const session = await this.sessionsRepository.create({
        userId: user.id,
        ip: dto.ipAddress,
        userAgent: dto.userAgent,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isRevoked: false,
        refreshTokenHash: '',
      });

      let condominiumKey = '';

      if (user.role === 'ADMIN') {
        const condominium = await this.condominiumsRepository.findOneByAdminId(
          user.id,
        );
        if (condominium) condominiumKey = condominium.key;
      }

      const payload = {
        sub: user.id,
        role: user.role,
        sessionId: session.id,
        condominiumKey,
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '30d',
      });

      const refreshTokenHash = await this.encryptionService.hash(refreshToken);

      await this.sessionsRepository.update({
        id: session.id,
        refreshTokenHash,
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new FatalErrorException(
        'Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.',
        error,
      );
    }
  }
}
