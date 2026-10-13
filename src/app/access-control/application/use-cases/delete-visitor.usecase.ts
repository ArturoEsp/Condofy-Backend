import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import VisitorsRepository from '../../domain/repositories/visitors.repository';
import { DeleteVisitorCommand } from '../commands/delete-visitor.command';
import { ResidentNotFoundException } from '@/app/residents/application/use-cases/create-family-member.usecase';
import { ResidentHouseNotFoundException } from '@/app/residents/application/use-cases/get-my-house.usecase';
import { VisitorNotFoundException } from '../exceptions/visitor-not-found.exception';

export interface DeleteVisitorResult {
  success: boolean;
  message: string;
  archived: boolean;
}

export class DeleteVisitorUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly visitorsRepository: VisitorsRepository,
  ) {}

  async execute(command: DeleteVisitorCommand): Promise<DeleteVisitorResult> {
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

    const authCount = await this.visitorsRepository.countAuthorizations(
      command.id,
    );

    if (authCount > 0) {
      await this.visitorsRepository.softDelete(command.id);
      return {
        success: true,
        message:
          'Visitante archivado de su agenda para conservar el historial de accesos de seguridad.',
        archived: true,
      };
    }

    await this.visitorsRepository.delete(command.id);
    return {
      success: true,
      message: 'Visitante eliminado exitosamente de su agenda.',
      archived: false,
    };
  }
}
