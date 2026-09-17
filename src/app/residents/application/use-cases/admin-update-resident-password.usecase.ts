import { Injectable, NotFoundException } from '@nestjs/common';
import ResidentsRepository from '../../domain/repositories/residents.repository';
import UsersRepository from '@/app/users/domain/repositories/users.repository';
import { EncryptionService } from '@/core/domain/services/encryption.service';
import UserSessionRepository from '@/app/auth/domain/repositories/user-session.repository';

export interface AdminUpdateResidentPasswordResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class AdminUpdateResidentPasswordUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly encryptionService: EncryptionService,
    private readonly userSessionRepository: UserSessionRepository,
  ) {}

  async execute(
    residentId: string,
    condominiumId: string,
    newPassword: string,
  ): Promise<AdminUpdateResidentPasswordResponse> {
    const resident = await this.residentsRepository.findOneById(residentId);

    if (!resident || resident.condominiumId !== condominiumId) {
      throw new NotFoundException('Residente no encontrado en este condominio');
    }

    const user = await this.usersRepository.findOneById(resident.userId);
    if (!user) {
      throw new NotFoundException(
        'Usuario asociado al residente no encontrado',
      );
    }

    // Hashear la nueva contraseña
    const passwordHash = await this.encryptionService.hash(newPassword);

    // Si el usuario estaba PENDING, activarlo
    const updatedStatus = user.status === 'PENDING' ? 'ACTIVE' : user.status;

    await this.usersRepository.update(user.id, {
      passwordHash,
      status: updatedStatus,
    });

    // Revocar sesiones existentes por seguridad
    try {
      await this.userSessionRepository.deleteByUserId(user.id);
    } catch {
      // Ignorar fallo al revocar sesiones
    }

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    };
  }
}
