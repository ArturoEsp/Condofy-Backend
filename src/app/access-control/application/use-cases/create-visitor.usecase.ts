import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import VisitorsRepository from '../../domain/repositories/visitors.repository';
import { CreateVisitorCommand } from '../commands/create-visitor.command';
import { ResidentNotFoundException } from '@/app/residents/application/use-cases/create-family-member.usecase';
import { ResidentHouseNotFoundException } from '@/app/residents/application/use-cases/get-my-house.usecase';
import { VisitorEntity } from '../../domain/entities/visitor.entity';

export class CreateVisitorUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly visitorsRepository: VisitorsRepository,
  ) {}

  async execute(command: CreateVisitorCommand): Promise<VisitorEntity> {
    const resident = await this.residentsRepository.findOneByUserId(
      command.currentUserId,
    );

    if (!resident || resident.condominiumId !== command.condominiumId) {
      throw new ResidentNotFoundException();
    }

    if (!resident.houseId) {
      throw new ResidentHouseNotFoundException();
    }

    const visitor = await this.visitorsRepository.create({
      houseId: resident.houseId,
      firstName: command.firstName,
      lastName: command.lastName ?? null,
      phone: command.phone ?? null,
      email: command.email ?? null,
      photo: command.photo ?? null,
      category: command.category,
      vehiclePlate: command.vehiclePlate ?? null,
      notes: command.notes ?? null,
    });

    return visitor;
  }
}
