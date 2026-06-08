import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { PROVIDES_NAMES } from '@/app/common/enums/provides-names.enums';
import CondominiumsRepository from '../../domain/repositories/condominiums.repository';

const FATAL_ERROR_MESSAGE = 'Error fetching condominium by key';

@Injectable()
export class GetCondominiumByKeyUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.CondominiumsRepository)
    private readonly condominiumsRepository: CondominiumsRepository,
  ) {}

  async execute(key: string) {
    try {
      return await this.condominiumsRepository.findOneByKey(key);
    } catch (error) {
      throw new InternalServerErrorException(FATAL_ERROR_MESSAGE, {
        cause: error,
      });
    }
  }
}
