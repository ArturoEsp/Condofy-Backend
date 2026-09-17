import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import UsersRepository from '@/app/users/domain/repositories/users.repository';
import { EncryptionService } from '@/core/domain/services/encryption.service';

export interface ChangePasswordCommand {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(
    userId: string,
    command: ChangePasswordCommand,
  ): Promise<ChangePasswordResponse> {
    const user = await this.usersRepository.findOneById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Validar que la contraseña actual coincida con el hash almacenado
    const isPasswordValid = await this.encryptionService.compare(
      command.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Hashear la nueva contraseña
    const newPasswordHash = await this.encryptionService.hash(
      command.newPassword,
    );

    // Actualizar la contraseña del usuario
    await this.usersRepository.update(user.id, {
      passwordHash: newPasswordHash,
    });

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
    };
  }
}
