import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AnnouncementsRepository } from '../../domain/repositories/announcements.repository';
import { AnnouncementEntity } from '../../domain/entities/announcement.entity';

@Injectable()
export class GetAnnouncementByIdUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AnnouncementsRepository)
    private readonly repository: AnnouncementsRepository,
  ) {}

  async execute(
    id: string,
    condominiumId: string,
  ): Promise<AnnouncementEntity> {
    const announcement = await this.repository.findById(id, condominiumId);
    if (!announcement) {
      throw new NotFoundException('El comunicado no fue encontrado');
    }
    return announcement;
  }
}
