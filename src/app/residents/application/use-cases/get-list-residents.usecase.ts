import HousesRepository from '@/app/houses/domain/repositories/houses.repository';
import ResidentsRepository from '../../domain/repositories/residents.repository';
import { ParamsListResidentsCommand } from '../commands/params-list-residents.command';
import { FatalErrorException } from '@/common/errors/fatal-message.error';
import { ListResidentsCommand } from '../commands/list-residents.command';

export class GetListResidentsUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly housesRepository: HousesRepository,
  ) {}

  async execute(
    params: ParamsListResidentsCommand,
    condominiumId: string,
  ): Promise<ListResidentsCommand> {
    const { page, size, search, orderBy } = params;

    const query = {
      page,
      size,
      fullText: search,
      orderBy,
      condominiumId,
    };

    try {
      const houses = await this.housesRepository.findMany({
        condominiumId,
      });

      const mapHouses = new Map(houses.map((house) => [house.id, house]));

      const [residents, count] = await Promise.all([
        this.residentsRepository.findMany(query),
        this.residentsRepository.count(query),
      ]);

      const residentsWithHouse = residents.map((resident) => {
        const house = mapHouses.get(resident.houseId);
        return { ...resident, houseNumber: house.houseNumber };
      });

      return { residents: residentsWithHouse, count };
    } catch (err) {
      console.log(err);
      throw new FatalErrorException('Error al listar los residentes.', err);
    }
  }
}
