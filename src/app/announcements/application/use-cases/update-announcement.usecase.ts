import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import {
  AnnouncementsRepository,
  UpdateAnnouncementData,
} from '../../domain/repositories/announcements.repository';
import { AnnouncementEntity } from '../../domain/entities/announcement.entity';

@Injectable()
export class UpdateAnnouncementUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AnnouncementsRepository)
    private readonly repository: AnnouncementsRepository,
  ) {}

  async execute(
    id: string,
    condominiumId: string,
    data: UpdateAnnouncementData,
  ): Promise<AnnouncementEntity> {
    return this.repository.update(id, condominiumId, data);
  }
}
