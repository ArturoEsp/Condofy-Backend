import UsersRepository from '@/app/users/domain/repositories/users.repository';
import { InvalidCredentialsException } from '../errors/invalid-credentials.exception';
import { MeInfoDTO } from '../commands/me-info.command';
import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import CondominiumsRepository from '@/app/condominiums/domain/repositories/condominiums.repository';

export class MeUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly residentsRepository: ResidentsRepository,
    private readonly condominiumsRepository: CondominiumsRepository,
  ) {}

  async execute(userId: string): Promise<MeInfoDTO> {
    const user = await this.usersRepository.findOneById(userId);

    const resident = {
      firstName: '',
      lastName: '',
      phone: '',
    };

    const condominium = {
      condominiumKey: '',
      condominiumName: '',
    };

    if (!user) throw new InvalidCredentialsException();

    const findCondominium = await this.condominiumsRepository.findOneByAdminId(
      user.id,
    );

    if (findCondominium) {
      condominium.condominiumKey = findCondominium.key;
      condominium.condominiumName = findCondominium.name;
    }

    if (user.role === 'ADMIN') {
      resident.firstName = user.firstName || '';
      resident.lastName = user.lastName || '';
      resident.phone = user.phone || '';
    }

    if (user.role === 'STAND') {
      resident.firstName = 'Caseta';
      resident.lastName = 'Vigilancia';

      if (user.condominiumId) {
        const condo = await this.condominiumsRepository.findOneById(
          user.condominiumId,
        );
        if (condo) {
          condominium.condominiumKey = condo.key;
          condominium.condominiumName = condo.name;
        }
      }
    }

    if (user.role === 'RESIDENT') {
      const profileResident = await this.residentsRepository.findOneByUserId(
        user.id,
      );

      if (profileResident) {
        resident.firstName = profileResident.firstName;
        resident.lastName = profileResident.lastName;
        resident.phone = profileResident.phone;

        if (profileResident.condominiumId) {
          const condo = await this.condominiumsRepository.findOneById(
            profileResident.condominiumId,
          );
          if (condo) {
            condominium.condominiumKey = condo.key;
            condominium.condominiumName = condo.name;
          }
        }
      }
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      updatedAt: user.updatedAt.toISOString(),
      ...condominium,
      ...resident,
    };
  }
}
