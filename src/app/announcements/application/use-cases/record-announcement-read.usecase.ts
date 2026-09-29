import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AnnouncementsRepository } from '../../domain/repositories/announcements.repository';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class RecordAnnouncementReadUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AnnouncementsRepository)
    private readonly repository: AnnouncementsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(params: {
    announcementId: string;
    userId: string;
    condominiumId: string;
  }): Promise<{ wasRecorded: boolean }> {
    const residentProfile = await this.prisma.residentProfile.findUnique({
      where: { userId: params.userId },
      select: { houseId: true },
    });

    return this.repository.recordReader({
      announcementId: params.announcementId,
      userId: params.userId,
      houseId: residentProfile?.houseId ?? null,
    });
  }
}
