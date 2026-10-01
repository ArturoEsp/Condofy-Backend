import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import VisitorsRepository from '../../domain/repositories/visitors.repository';
import { UpdateVisitorCommand } from '../commands/update-visitor.command';
import { ResidentNotFoundException } from '@/app/residents/application/use-cases/create-family-member.usecase';
import { ResidentHouseNotFoundException } from '@/app/residents/application/use-cases/get-my-house.usecase';
import { VisitorNotFoundException } from '../exceptions/visitor-not-found.exception';
import { VisitorEntity } from '../../domain/entities/visitor.entity';

export class UpdateVisitorUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly visitorsRepository: VisitorsRepository,
  ) {}

  async execute(command: UpdateVisitorCommand): Promise<VisitorEntity> {
    const resident = await this.residentsRepository.findOneByUserId(
      command.currentUserId,
    );

    if (!resident || resident.condominiumId !== command.condominiumId) {
      throw new ResidentNotFoundException();
    }

    if (!resident.houseId) {
      throw new ResidentHouseNotFoundException();
    }

    const existingVisitor = await this.visitorsRepository.findOneById(command.id);

    if (
      !existingVisitor ||
      existingVisitor.houseId !== resident.houseId ||
      !existingVisitor.isActive
    ) {
      throw new VisitorNotFoundException();
    }

    const updated = await this.visitorsRepository.update(command.id, {
      firstName: command.firstName,
      lastName: command.lastName,
      phone: command.phone,
      email: command.email,
      photo: command.photo,
      category: command.category,
      vehiclePlate: command.vehiclePlate,
      notes: command.notes,
    });

    return updated;
  }
}
