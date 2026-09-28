import { StandContactsRepository } from '../../domain/repositories/stand-contacts.repository';
import { CreateStandContactRequest } from '../../presentation/dtos/requests/create-stand-contact.request';

export class CreateStandContactUseCase {
  constructor(
    private readonly standContactsRepository: StandContactsRepository,
  ) {}

  async execute(condominiumId: string, dto: CreateStandContactRequest) {
    const existingCount =
      await this.standContactsRepository.countByCondominium(condominiumId);

    const isPrimary = dto.isPrimary ?? existingCount === 0;

    if (isPrimary) {
      await this.standContactsRepository.unsetPrimary(condominiumId);
    }

    return await this.standContactsRepository.create({
      condominiumId,
      name: dto.name.trim(),
      phoneNumber: dto.phoneNumber.trim(),
      extension: dto.extension?.trim() || null,
      schedule: dto.schedule?.trim() || '24/7',
      hasWhatsapp: dto.hasWhatsapp ?? true,
      isPrimary,
      notes: dto.notes?.trim() || null,
      isActive: dto.isActive ?? true,
    });
  }
}
