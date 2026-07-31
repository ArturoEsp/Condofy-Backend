import { CreateUserUseCase } from '@/app/users/application/use-cases/create-user.usecase';
import ResidentsRepository from '../../domain/repositories/residents.repository';
import { CreateResidentCommand } from '../commands/create-redisent.command';
import { FatalErrorException } from '@/common/errors/fatal-message.error';
import HousesRepository from '@/app/houses/domain/repositories/houses.repository';
import { HouseNotExistsException } from '@/app/houses/application/exceptions/house-not-exist.exception';

export class CreateResidentUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly housesRepository: HousesRepository,
    private readonly createUser: CreateUserUseCase,
  ) {}

  async execute(data: CreateResidentCommand) {
    const house = await this.housesRepository.findOneById(data.houseId);

    if (!house) throw new HouseNotExistsException();

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
        userId: user.id,
        condominiumId: data.condominiumId,
      });

      return resident;
    } catch (err) {
      throw new FatalErrorException('Error al crear el residente.', err);
    }
  }
}
