import { NotFoundException } from '@nestjs/common';
import { StandContactsRepository } from '../../domain/repositories/stand-contacts.repository';
import { UpdateStandContactRequest } from '../../presentation/dtos/requests/update-stand-contact.request';

export class UpdateStandContactUseCase {
  constructor(
    private readonly standContactsRepository: StandContactsRepository,
  ) {}

  async execute(
    condominiumId: string,
    id: string,
    dto: UpdateStandContactRequest,
  ) {
    const contact = await this.standContactsRepository.findById(id);
    if (!contact || contact.condominiumId !== condominiumId) {
      throw new NotFoundException('Contacto de caseta no encontrado');
    }

    if (dto.isPrimary === true) {
      await this.standContactsRepository.unsetPrimary(condominiumId, id);
    }

    return await this.standContactsRepository.update(id, {
      name: dto.name !== undefined ? dto.name.trim() : undefined,
      phoneNumber:
        dto.phoneNumber !== undefined ? dto.phoneNumber.trim() : undefined,
      extension:
        dto.extension !== undefined ? dto.extension?.trim() || null : undefined,
      schedule:
        dto.schedule !== undefined ? dto.schedule?.trim() || '24/7' : undefined,
      hasWhatsapp: dto.hasWhatsapp,
      isPrimary: dto.isPrimary,
      notes: dto.notes !== undefined ? dto.notes?.trim() || null : undefined,
      isActive: dto.isActive,
    });
  }
}
