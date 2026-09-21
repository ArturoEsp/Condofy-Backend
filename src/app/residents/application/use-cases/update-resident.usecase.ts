import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import ResidentsRepository from '../../domain/repositories/residents.repository';
import UsersRepository from '@/app/users/domain/repositories/users.repository';
import { UpdateResidentRequest } from '../../presentation/dtos/requests/update-resident.request';
import { ResidentEntity } from '../../domain/entities/resident.entity';

@Injectable()
export class UpdateResidentUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    residentId: string,
    condominiumId: string,
    dto: UpdateResidentRequest,
  ): Promise<ResidentEntity> {
    const resident = await this.residentsRepository.findOneById(residentId);

    if (!resident || resident.condominiumId !== condominiumId) {
      throw new NotFoundException(
        'Residente no encontrado en este condominio.',
      );
    }

    const user = await this.usersRepository.findOneById(resident.userId);
    if (!user) {
      throw new NotFoundException(
        'Usuario asociado al residente no encontrado.',
      );
    }

    // Si se modifica el correo electrónico, verificar que no esté ocupado por otro usuario
    if (
      dto.email &&
      dto.email.trim().toLowerCase() !== user.email.toLowerCase()
    ) {
      const normalizedEmail = dto.email.trim().toLowerCase();
      const existingUser =
        await this.usersRepository.findOneByEmail(normalizedEmail);

      if (existingUser && existingUser.id !== user.id) {
        throw new ConflictException(
          'El correo electrónico ya está registrado por otro usuario.',
        );
      }
    }

    const firstName =
      dto.firstName !== undefined ? dto.firstName.trim() : undefined;
    const lastName =
      dto.lastName !== undefined ? dto.lastName.trim() : undefined;
    const phone =
      dto.phone !== undefined
        ? dto.phone
          ? dto.phone.trim()
          : null
        : undefined;
    const email =
      dto.email !== undefined ? dto.email.trim().toLowerCase() : undefined;

    // 1. Actualizar credenciales y datos en la entidad User
    if (
      firstName !== undefined ||
      lastName !== undefined ||
      phone !== undefined ||
      email !== undefined
    ) {
      await this.usersRepository.update(user.id, {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
      });
    }

    // 2. Actualizar perfil de residente en ResidentProfile
    const updatedResident = await this.residentsRepository.update(resident.id, {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(dto.residentType !== undefined && { residentType: dto.residentType }),
      ...(dto.houseId !== undefined && { houseId: dto.houseId }),
      ...(dto.comments !== undefined && { comments: dto.comments }),
    });

    return updatedResident;
  }
}
