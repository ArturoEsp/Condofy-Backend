import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AnnouncementsRepository } from '../../domain/repositories/announcements.repository';

@Injectable()
export class DeleteAnnouncementUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AnnouncementsRepository)
    private readonly repository: AnnouncementsRepository,
  ) {}

  async execute(id: string, condominiumId: string): Promise<void> {
    await this.repository.delete(id, condominiumId);
  }
}
