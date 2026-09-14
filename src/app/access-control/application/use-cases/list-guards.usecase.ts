import UsersRepository from '@/app/users/domain/repositories/users.repository';
import { UserRole } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class ListGuardsUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(condominiumId: string) {
    return await this.usersRepository.findMany({
      where: {
        role: UserRole.STAND,
        condominiumId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
