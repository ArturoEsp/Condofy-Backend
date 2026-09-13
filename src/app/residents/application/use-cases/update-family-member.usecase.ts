import ResidentsRepository from '../../domain/repositories/residents.repository';
import UsersRepository from '@/app/users/domain/repositories/users.repository';
import { EncryptionService } from '@/core/domain/services/encryption.service';
import { UpdateFamilyMemberCommand } from '../commands/update-family-member.command';
import { ApplicationException } from '@/core/application/error/application.exception';
import { ResidentNotFoundException } from './create-family-member.usecase';

export class FamilyMemberNotBelongToHouseException extends ApplicationException {
  readonly codeError = 403;
  constructor(message = 'El miembro no pertenece a tu hogar.') {
    super(message);
  }
}

export class UpdateFamilyMemberUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(data: UpdateFamilyMemberCommand) {
    const currentResident = await this.residentsRepository.findOneByUserId(
      data.currentUserId,
    );

    if (
      !currentResident ||
      currentResident.condominiumId !== data.condominiumId
    ) {
      throw new ResidentNotFoundException();
    }

    const targetResident = await this.residentsRepository.findOneById(
      data.familyMemberId,
    );

    if (
      !targetResident ||
      targetResident.houseId !== currentResident.houseId ||
      targetResident.condominiumId !== data.condominiumId
    ) {
      throw new FamilyMemberNotBelongToHouseException();
    }

    if (
      targetResident.residentType === 'PRIMARY' &&
      targetResident.id !== currentResident.id
    ) {
      throw new FamilyMemberNotBelongToHouseException(
        'No tienes permisos para modificar al residente principal.',
      );
    }

    // Actualizar credenciales de usuario si fueron provistas
    if (data.password || data.email) {
      let passwordHash: string | undefined;
      if (data.password) {
        passwordHash = await this.encryptionService.hash(data.password);
      }

      await this.usersRepository.update(targetResident.userId, {
        ...(data.email && { email: data.email }),
        ...(passwordHash && { passwordHash }),
      });
    }

    // Actualizar datos del perfil de residente
    const updated = await this.residentsRepository.update(targetResident.id, {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.comments !== undefined && { comments: data.comments }),
      ...(data.canCreateVisits !== undefined && {
        canCreateVisits: data.canCreateVisits,
      }),
      ...(data.residentType && { residentType: data.residentType }),
    });

    return updated;
  }
}
