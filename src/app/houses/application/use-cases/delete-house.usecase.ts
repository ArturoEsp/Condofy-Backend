import HousesRepository from '../../domain/repositories/houses.repository';

export class DeleteHouseUseCase {
  constructor(private readonly housesRepository: HousesRepository) {}
}
