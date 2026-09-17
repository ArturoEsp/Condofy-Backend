import { Injectable, NotFoundException } from '@nestjs/common';
import ResidentsRepository from '../../domain/repositories/residents.repository';
import { RequestPasswordResetUseCase } from '@/app/auth/application/use-cases/request-password-reset.usecase';

export interface AdminSendResidentResetPasswordResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class AdminSendResidentResetPasswordUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
  ) {}

  async execute(
    residentId: string,
    condominiumId: string,
  ): Promise<AdminSendResidentResetPasswordResponse> {
    const resident = await this.residentsRepository.findOneById(residentId);

    if (!resident || resident.condominiumId !== condominiumId) {
      throw new NotFoundException('Residente no encontrado en este condominio');
    }

    await this.requestPasswordResetUseCase.execute({
      email: resident.email,
    });

    return {
      success: true,
      message:
        'Enlace de restablecimiento de contraseña enviado al residente exitosamente.',
    };
  }
}
