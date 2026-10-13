import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import CondominiumsRepository from '@/app/condominiums/domain/repositories/condominiums.repository';
import { SuperadminCreateCondominiumCommand } from '../commands/create-condominium.command';

@Injectable()
export class SuperadminCreateCondominiumUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.CondominiumsRepository)
    private readonly condominiumsRepository: CondominiumsRepository,
  ) {}

  async execute(data: SuperadminCreateCondominiumCommand) {
    return await this.condominiumsRepository.create(data);
  }
}
