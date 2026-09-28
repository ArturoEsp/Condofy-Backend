import { NotFoundException } from '@nestjs/common';
import { StandContactsRepository } from '../../domain/repositories/stand-contacts.repository';

export class DeleteStandContactUseCase {
  constructor(
    private readonly standContactsRepository: StandContactsRepository,
  ) {}

  async execute(condominiumId: string, id: string) {
    const contact = await this.standContactsRepository.findById(id);
    if (!contact || contact.condominiumId !== condominiumId) {
      throw new NotFoundException('Contacto de caseta no encontrado');
    }

    await this.standContactsRepository.delete(id);
    return {
      success: true,
      message: 'Contacto de caseta eliminado exitosamente',
    };
  }
}
