import ResidentsRepository from '../../domain/repositories/residents.repository';
import UsersRepository from '@/app/users/domain/repositories/users.repository';
import UserSessionRepository from '@/app/auth/domain/repositories/user-session.repository';
import { ToggleFamilyMemberStatusCommand } from '../commands/toggle-family-member-status.command';
import { ApplicationException } from '@/core/application/error/application.exception';
import { ResidentNotFoundException } from './create-family-member.usecase';
import { FamilyMemberNotBelongToHouseException } from './update-family-member.usecase';
import { UserStatus } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class CannotDeactivateSelfException extends ApplicationException {
  readonly codeError = 400;
  constructor(message = 'No puedes desactivar tu propia cuenta.') {
    super(message);
  }
}

export class ToggleFamilyMemberStatusUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly userSessionRepository: UserSessionRepository,
  ) {}

  async execute(data: ToggleFamilyMemberStatusCommand) {
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

    if (targetResident.userId === data.currentUserId) {
      throw new CannotDeactivateSelfException();
    }

    if (targetResident.residentType === 'PRIMARY') {
      throw new FamilyMemberNotBelongToHouseException(
        'No puedes desactivar al residente principal.',
      );
    }

    const newStatus: UserStatus = data.isActive
      ? UserStatus.ACTIVE
      : UserStatus.INACTIVE;

    await this.usersRepository.update(targetResident.userId, {
      status: newStatus,
    });

    if (!data.isActive) {
      await this.userSessionRepository.deleteByUserId(targetResident.userId);
    }

    return {
      id: targetResident.id,
      userId: targetResident.userId,
      status: newStatus,
    };
  }
}
