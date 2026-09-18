import ResidentsRepository from '../../domain/repositories/residents.repository';
import { ParamsListResidentsCommand } from '../commands/params-list-residents.command';
import { FatalErrorException } from '@/common/errors/fatal-message.error';
import { ListResidentsCommand } from '../commands/list-residents.command';

export class GetListResidentsUseCase {
  constructor(private readonly residentsRepository: ResidentsRepository) {}

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
      const [residents, count] = await Promise.all([
        this.residentsRepository.findMany(query),
        this.residentsRepository.count(query),
      ]);

      return {
        residents: residents.map((resident) => ({
          ...resident,
          houseNumber: resident.houseNumber || '',
          tower: resident.tower || '',
        })),
        count,
      };
    } catch (err) {
      throw new FatalErrorException('Error al listar los residentes.', err);
    }
  }
}
