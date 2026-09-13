import CondominiumsRepository from '../../domain/repositories/condominiums.repository';
import { FatalErrorException } from '@/common/errors/fatal-message.error';

const FATAL_ERROR_MESSAGE = 'Error fetching condominium by key';

export class GetCondominiumByKeyUseCase {
  constructor(
    private readonly condominiumsRepository: CondominiumsRepository,
  ) {}

  async execute(key: string) {
    try {
      return await this.condominiumsRepository.findOneByKey(key);
    } catch (error) {
      throw new FatalErrorException(FATAL_ERROR_MESSAGE, error);
    }
  }
}
