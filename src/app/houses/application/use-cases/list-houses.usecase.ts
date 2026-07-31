import { FatalErrorException } from '@/common/errors/fatal-message.error';
import HousesRepository from '../../domain/repositories/houses.repository';
import { ParamsListHousesCommand } from '../commands/params-list-houses.command';

export class ListHousesUseCase {
  constructor(private readonly housesRepository: HousesRepository) {}

  async execute(params: ParamsListHousesCommand, condominiumId: string) {
    const { page, size, search, orderBy } = params;

    const query = {
      page,
      size,
      fullText: search,
      orderBy,
      condominiumId,
    };

    try {
      const [houses, count] = await Promise.all([
        this.housesRepository.findMany(query),
        this.housesRepository.count(query),
      ]);

      return { houses, count };
    } catch {
      throw new FatalErrorException('Error al listar las casas.');
    }
  }
}
