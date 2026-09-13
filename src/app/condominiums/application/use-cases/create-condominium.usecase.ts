import CondominiumsRepository from '../../domain/repositories/condominiums.repository';
import { CreateCondominiumCommand } from '../commands/create-condominium.command';
import { FatalErrorException } from '@/common/errors/fatal-message.error';

const FATAL_ERROR_MESSAGE = 'Error creating condominium';

export class CreateCondominiumUseCase {
  constructor(
    private readonly condominiumsRepository: CondominiumsRepository,
  ) {}

  async execute(data: CreateCondominiumCommand) {
    try {
      await this.condominiumsRepository.create(data);
    } catch (error) {
      throw new FatalErrorException(FATAL_ERROR_MESSAGE, error);
    }
  }
}
