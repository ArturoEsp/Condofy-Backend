import UsersRepository from '@/app/users/domain/repositories/users.repository';
import { UserRole } from '@/core/infrastructure/persistence/prisma/generated/enums';
import { GuardNotFoundException } from './update-guard-status.usecase';

export class DeleteGuardUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string, condominiumId: string) {
    const user = await this.usersRepository.findOneById(id);
    if (
      !user ||
      user.condominiumId !== condominiumId ||
      user.role !== UserRole.STAND
    ) {
      throw new GuardNotFoundException();
    }

    await this.usersRepository.delete(id);
    return { success: true, message: 'Guardia eliminado exitosamente' };
  }
}
