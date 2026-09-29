import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AnnouncementsRepository } from '../../domain/repositories/announcements.repository';
import { AnnouncementEntity } from '../../domain/entities/announcement.entity';

@Injectable()
export class ToggleAnnouncementActiveUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AnnouncementsRepository)
    private readonly repository: AnnouncementsRepository,
  ) {}

  async execute(
    id: string,
    condominiumId: string,
  ): Promise<AnnouncementEntity> {
    return this.repository.toggleActive(id, condominiumId);
  }
}
