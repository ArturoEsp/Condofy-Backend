import { CreateUserUseCase } from '@/app/users/application/use-cases/create-user.usecase';
import ResidentsRepository from '../../domain/repositories/residents.repository';
import { CreateResidentCommand } from '../commands/create-resident.command';
import { FatalErrorException } from '@/common/errors/fatal-message.error';
import HousesRepository from '@/app/houses/domain/repositories/houses.repository';
import { HouseNotExistsException } from '@/app/houses/application/exceptions/house-not-exist.exception';
import UsersRepository from '@/app/users/domain/repositories/users.repository';

export class CreateResidentUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly housesRepository: HousesRepository,
    private readonly createUser: CreateUserUseCase,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(data: CreateResidentCommand) {
    const house = await this.housesRepository.findOneById(data.houseId);

    if (!house || house.condominiumId !== data.condominiumId) {
      throw new HouseNotExistsException();
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
        comments: null,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        houseId: data.houseId,
        residentType: data.residentType,
        canCreateVisits: true,
        userId: user.id,
        condominiumId: data.condominiumId,
      });

      return resident;
    } catch (err) {
      try {
        await this.usersRepository.delete(user.id);
      } catch (rollbackErr) {
        console.error('Failed to rollback created user:', rollbackErr);
      }
      throw new FatalErrorException('Error al crear el residente.', err);
    }
  }
}
