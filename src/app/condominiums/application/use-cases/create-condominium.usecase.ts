import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import CondominiumsRepository from '../../domain/repositories/condominiums.repository';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { CreateCondominiumRequest } from '../../presentation/dtos/requests/create-condominium.request';

const FATAL_ERROR_MESSAGE = 'Error creating condominium';

@Injectable()
export class CreateCondominiumUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.CondominiumsRepository)
    private readonly condominiumsRepository: CondominiumsRepository,
  ) {}

  async execute(data: CreateCondominiumRequest) {
    try {
      await this.condominiumsRepository.create(data);
    } catch (error) {
      throw new InternalServerErrorException(FATAL_ERROR_MESSAGE, {
        cause: error,
      });
    }
  }
}
