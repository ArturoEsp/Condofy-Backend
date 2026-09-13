import ResidentsRepository from '../../domain/repositories/residents.repository';
import { ResidentNotFoundException } from './create-family-member.usecase';

export class ListFamilyMembersUseCase {
  constructor(private readonly residentsRepository: ResidentsRepository) {}

  async execute(currentUserId: string, condominiumId: string) {
    const currentResident =
      await this.residentsRepository.findOneByUserId(currentUserId);

    if (!currentResident || currentResident.condominiumId !== condominiumId) {
      throw new ResidentNotFoundException();
    }

    const members = await this.residentsRepository.findManyByHouseId(
      currentResident.houseId,
    );

    return members.filter((member) => member.userId !== currentUserId);
  }
}
