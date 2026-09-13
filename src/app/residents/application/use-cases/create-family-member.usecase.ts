import ResidentsRepository from '../../domain/repositories/residents.repository';
import { CreateUserUseCase } from '@/app/users/application/use-cases/create-user.usecase';
import UsersRepository from '@/app/users/domain/repositories/users.repository';
import { CreateFamilyMemberCommand } from '../commands/create-family-member.command';
import { FatalErrorException } from '@/common/errors/fatal-message.error';
import { ApplicationException } from '@/core/application/error/application.exception';

export class ResidentNotFoundException extends ApplicationException {
  readonly codeError = 404;
  constructor(message = 'Perfil de residente no encontrado.') {
    super(message);
  }
}

export class CreateFamilyMemberUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly createUser: CreateUserUseCase,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(data: CreateFamilyMemberCommand) {
    const currentResident = await this.residentsRepository.findOneByUserId(
      data.currentUserId,
    );

    if (
      !currentResident ||
      currentResident.condominiumId !== data.condominiumId
    ) {
      throw new ResidentNotFoundException();
    }

    const user = await this.createUser.execute({
      email: data.email,
      password: data.password,
      isEmailVerified: true,
      role: 'RESIDENT',
      status: 'ACTIVE',
    });

    try {
      const resident = await this.residentsRepository.create({
        comments: data.comments ?? null,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? null,
        houseId: currentResident.houseId,
        condominiumId: data.condominiumId,
        residentType: data.residentType,
        canCreateVisits: data.canCreateVisits ?? true,
        userId: user.id,
      });

      return resident;
    } catch (err) {
      try {
        await this.usersRepository.delete(user.id);
      } catch (rollbackErr) {
        console.error('Failed to rollback user:', rollbackErr);
      }
      throw new FatalErrorException('Error al crear el familiar.', err);
    }
  }
}
