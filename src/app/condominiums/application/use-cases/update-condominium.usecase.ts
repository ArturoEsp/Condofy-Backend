import { Injectable, NotFoundException } from '@nestjs/common';
import CondominiumsRepository, {
  CreateCondominium,
} from '../../domain/repositories/condominiums.repository';
import { CondominiumEntity } from '../../domain/entities/condominium.entity';

@Injectable()
export class UpdateCondominiumUseCase {
  constructor(
    private readonly condominiumsRepository: CondominiumsRepository,
  ) {}

  async execute(
    condominiumId: string,
    data: Partial<CreateCondominium>,
  ): Promise<CondominiumEntity> {
    const condominium =
      await this.condominiumsRepository.findOneById(condominiumId);

    if (!condominium) {
      throw new NotFoundException('Condominio no encontrado');
    }

    return await this.condominiumsRepository.update(condominiumId, data);
  }
}
