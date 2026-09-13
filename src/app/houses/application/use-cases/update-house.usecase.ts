import { FatalErrorException } from '@/common/errors/fatal-message.error';
import HousesRepository from '../../domain/repositories/houses.repository';
import { HouseNotExistsException } from '../exceptions/house-not-exist.exception';
import { HouseExistsException } from '../exceptions/house-exists.exception';
import { UpdateHouseCommand } from '../commands/update-house.command';

export class UpdateHouseUseCase {
  constructor(private readonly housesRepository: HousesRepository) {}

  async execute(id: string, data: UpdateHouseCommand, condominiumId: string) {
    const find = await this.housesRepository.findOneById(id);
    if (!find || find.condominiumId !== condominiumId) {
      throw new HouseNotExistsException();
    }

    const findHouseNumber = await this.housesRepository.findOneByNumber(
      data.houseNumber,
      condominiumId,
    );

    if (findHouseNumber && findHouseNumber.id !== id)
      throw new HouseExistsException();

    try {
      return await this.housesRepository.update(id, data);
    } catch (err) {
      throw new FatalErrorException('Error al actualizar la casa.', err);
    }
  }
}
