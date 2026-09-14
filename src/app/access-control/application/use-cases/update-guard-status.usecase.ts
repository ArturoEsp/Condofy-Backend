import UsersRepository from '@/app/users/domain/repositories/users.repository';
import {
  UserRole,
  UserStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';
import { ApplicationException } from '@/core/application/error/application.exception';

export class GuardNotFoundException extends ApplicationException {
  readonly codeError = 404;
  constructor(message = 'Guardia no encontrado en este condominio.') {
    super(message);
  }
}

export class UpdateGuardStatusUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string, status: UserStatus, condominiumId: string) {
    const user = await this.usersRepository.findOneById(id);
    if (
      !user ||
      user.condominiumId !== condominiumId ||
      user.role !== UserRole.STAND
    ) {
      throw new GuardNotFoundException();
    }

    return await this.usersRepository.update(id, {
      status,
    });
  }
}
