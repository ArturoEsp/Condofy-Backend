import { Injectable, NotFoundException } from '@nestjs/common';
import UsersRepository from '@/app/users/domain/repositories/users.repository';
import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import { MeUseCase } from './me.usecase';
import { MeInfoDTO } from '../commands/me-info.command';

export interface UpdateProfileCommand {
  firstName: string;
  lastName: string;
  phone?: string;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly residentsRepository: ResidentsRepository,
    private readonly meUseCase: MeUseCase,
  ) {}

  async execute(
    userId: string,
    command: UpdateProfileCommand,
  ): Promise<MeInfoDTO> {
    const user = await this.usersRepository.findOneById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { firstName, lastName, phone } = command;

    // Actualizar datos en la entidad User
    await this.usersRepository.update(user.id, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone ? phone.trim() : null,
    });

    // Si el usuario es un residente, actualizar también su perfil de residente asociado
    if (user.role === 'RESIDENT') {
      const residentProfile = await this.residentsRepository.findOneByUserId(
        user.id,
      );

      if (residentProfile) {
        await this.residentsRepository.update(residentProfile.id, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone ? phone.trim() : null,
        });
      }
    }

    // Retornar los datos actualizados del usuario
    return await this.meUseCase.execute(user.id);
  }
}
