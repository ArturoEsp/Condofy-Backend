import { StandContactsRepository } from '../../domain/repositories/stand-contacts.repository';

export class ListStandContactsUseCase {
  constructor(
    private readonly standContactsRepository: StandContactsRepository,
  ) {}

  async execute(condominiumId: string, onlyActive?: boolean) {
    return await this.standContactsRepository.findManyByCondominium(
      condominiumId,
      onlyActive,
    );
  }
}
