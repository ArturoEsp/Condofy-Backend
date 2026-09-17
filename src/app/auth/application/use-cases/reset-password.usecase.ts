import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import UsersRepository from '@/app/users/domain/repositories/users.repository';
import PasswordResetTokensRepository from '../../domain/repositories/password-reset-tokens.repository';
import { EncryptionService } from '@/core/domain/services/encryption.service';
import UserSessionRepository from '../../domain/repositories/user-session.repository';

export interface ResetPasswordCommand {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordResetTokensRepository: PasswordResetTokensRepository,
    private readonly encryptionService: EncryptionService,
    private readonly userSessionRepository: UserSessionRepository,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<ResetPasswordResponse> {
    const rawToken = command.token.trim();
    if (!rawToken) {
      throw new BadRequestException(
        'El token de restablecimiento es requerido',
      );
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const resetTokenRecord =
      await this.passwordResetTokensRepository.findByTokenHash(tokenHash);

    if (!resetTokenRecord || resetTokenRecord.usedAt !== null) {
      throw new BadRequestException(
        'El enlace para restablecer la contraseña es inválido o ya ha sido utilizado',
      );
    }

    if (new Date() > resetTokenRecord.expiresAt) {
      throw new BadRequestException(
        'El enlace para restablecer la contraseña ha expirado. Por favor solicita uno nuevo',
      );
    }

    const user = await this.usersRepository.findOneById(
      resetTokenRecord.userId,
    );

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Hashear la nueva contraseña con el servicio de encriptación
    const newPasswordHash = await this.encryptionService.hash(
      command.newPassword,
    );

    // Actualizar contraseña y activar al usuario si estaba en estado PENDING
    const updatedStatus = user.status === 'PENDING' ? 'ACTIVE' : user.status;
    await this.usersRepository.update(user.id, {
      passwordHash: newPasswordHash,
      status: updatedStatus,
    });

    // Marcar el token como consumido
    await this.passwordResetTokensRepository.markAsUsed(resetTokenRecord.id);

    // Revocar todas las sesiones activas del usuario por seguridad
    try {
      await this.userSessionRepository.deleteByUserId(user.id);
    } catch (err) {
      // Ignorar fallo al limpiar sesiones secundarias
    }

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.',
    };
  }
}
