import { Injectable, NotFoundException } from '@nestjs/common';
import CondominiumsRepository from '../../domain/repositories/condominiums.repository';
import { CondominiumEntity } from '../../domain/entities/condominium.entity';

@Injectable()
export class GetCondominiumDetailsUseCase {
  constructor(
    private readonly condominiumsRepository: CondominiumsRepository,
  ) {}

  async execute(condominiumId: string): Promise<CondominiumEntity> {
    const condominium =
      await this.condominiumsRepository.findOneById(condominiumId);

    if (!condominium) {
      throw new NotFoundException('Condominio no encontrado');
    }

    return condominium;
  }
}
