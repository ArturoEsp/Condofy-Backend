import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import {
  AnnouncementsRepository,
  FindAnnouncementsFilter,
} from '../../domain/repositories/announcements.repository';
import { AnnouncementEntity } from '../../domain/entities/announcement.entity';

@Injectable()
export class GetAnnouncementsUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AnnouncementsRepository)
    private readonly repository: AnnouncementsRepository,
  ) {}

  async execute(
    filter: FindAnnouncementsFilter,
  ): Promise<AnnouncementEntity[]> {
    return this.repository.findAll(filter);
  }
}
