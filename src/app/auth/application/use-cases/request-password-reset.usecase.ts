import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import UsersRepository from '@/app/users/domain/repositories/users.repository';
import PasswordResetTokensRepository from '../../domain/repositories/password-reset-tokens.repository';
import { MailService } from '@/core/domain/services/mail.service';

export interface RequestPasswordResetCommand {
  email: string;
}

export interface RequestPasswordResetResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class RequestPasswordResetUseCase {
  private readonly logger = new Logger(RequestPasswordResetUseCase.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordResetTokensRepository: PasswordResetTokensRepository,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    command: RequestPasswordResetCommand,
  ): Promise<RequestPasswordResetResponse> {
    const genericMessage =
      'Si el correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.';

    const normalizedEmail = command.email.trim().toLowerCase();
    const user = await this.usersRepository.findOneByEmail(normalizedEmail);

    if (!user) {
      this.logger.warn(
        `Solicitud de restablecimiento para correo no registrado: ${normalizedEmail}`,
      );
      return { success: true, message: genericMessage };
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      this.logger.warn(
        `Solicitud de restablecimiento para usuario inactivo o suspendido: ${user.id} (${user.status})`,
      );
      return { success: true, message: genericMessage };
    }

    // Generar token aleatorio criptográfico de 32 bytes
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    // Invalidar tokens previos pendientes del usuario
    await this.passwordResetTokensRepository.invalidateAllPendingForUser(
      user.id,
    );

    const expiresInMinutes = 30;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // Guardar token hasheado en la base de datos
    await this.passwordResetTokensRepository.create({
      tokenHash,
      userId: user.id,
      expiresAt,
    });

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const cleanFrontendUrl = frontendUrl.replace(/\/+$/, '');
    const resetUrl = `${cleanFrontendUrl}/reset-password?token=${rawToken}`;

    const recipientName = user.firstName
      ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
      : undefined;

    try {
      await this.mailService.sendPasswordResetEmail({
        to: user.email,
        recipientName,
        resetUrl,
        expiresInMinutes,
      });
    } catch (err: any) {
      this.logger.error(
        `Error al enviar correo de restablecimiento a ${user.email}: ${err.message}`,
      );
      // No re-lanzamos para no filtrar información al cliente, pero dejamos rastro en logs
    }

    return {
      success: true,
      message: genericMessage,
    };
  }
}
