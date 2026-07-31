import { FatalErrorException } from '@/common/errors/fatal-message.error';
import HousesRepository from '../../domain/repositories/houses.repository';
import { CreateHouseCommand } from '../commands/create-house.command';
import { HouseExistsException } from '../exceptions/house-exists.exception';

export class CreateHouseUseCase {
  constructor(private readonly housesRepository: HousesRepository) {}

  async execute(data: CreateHouseCommand) {
    const find = await this.housesRepository.findOneByNumber(
      data.houseNumber,
      data.condominiumId,
    );

    if (find) throw new HouseExistsException();

    try {
      const house = await this.housesRepository.create({
        condominiumId: data.condominiumId,
        houseNumber: data.houseNumber,
        tower: data.tower,
      });

      return house;
    } catch (err) {
      throw new FatalErrorException('Error al crear la casa.', err);
    }
  }
}
