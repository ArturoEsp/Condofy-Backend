import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { UserStatus } from '@/core/infrastructure/persistence/prisma/generated/enums';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';
import {
  GeneralProviderAccessEntity,
  GeneralProviderStatus,
} from '../../domain/entities/general-provider-access.entity';
import { GeneralProvidersRepository } from '../../domain/repositories/general-providers.repository';
import { GeneralProviderNotFoundException } from '../exceptions/general-provider-not-found.exception';
import { GeneralProviderAlreadyExitedException } from '../exceptions/general-provider-already-exited.exception';

export interface StandRegisterGeneralProviderExitDto {
  id: string;
  condominiumId: string;
  exitGuardId: string;
  exitNotes?: string;
  notifyResidents?: boolean;
}

export interface StandRegisterGeneralProviderExitResult {
  provider: GeneralProviderAccessEntity;
  notifiedResidentsCount: number;
  whatsappMessage: string;
}

@Injectable()
export class StandRegisterGeneralProviderExitUseCase {
  private readonly logger = new Logger(
    StandRegisterGeneralProviderExitUseCase.name,
  );

  constructor(
    private readonly generalProvidersRepository: GeneralProvidersRepository,
    private readonly prismaService: PrismaService,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(
    dto: StandRegisterGeneralProviderExitDto,
  ): Promise<StandRegisterGeneralProviderExitResult> {
    const existing = await this.generalProvidersRepository.findById(dto.id);

    if (!existing || existing.condominiumId !== dto.condominiumId) {
      throw new GeneralProviderNotFoundException();
    }

    if (existing.status === GeneralProviderStatus.EXITED) {
      throw new GeneralProviderAlreadyExitedException();
    }

    const provider = await this.generalProvidersRepository.registerExit({
      id: dto.id,
      exitGuardId: dto.exitGuardId,
      exitNotes: dto.exitNotes,
    });

    const whatsappMessage = `*Aviso de Caseta:* El proveedor *${provider.name}* ha concluido su recorrido y registrado su salida por caseta.`;

    let notifiedResidentsCount = 0;

    const shouldNotify = dto.notifyResidents !== false;

    if (shouldNotify) {
      try {
        const residents = await this.prismaService.residentProfile.findMany({
          where: {
            condominiumId: dto.condominiumId,
            user: {
              status: UserStatus.ACTIVE,
            },
          },
          select: {
            userId: true,
          },
        });

        const userIds = residents.map((r) => r.userId);

        if (userIds.length > 0) {
          await this.webPushService.sendNotificationToUsers(userIds, {
            title: `👋 ${provider.name} ha salido del condominio`,
            body: `El proveedor ${provider.name} ha finalizado su servicio y registrado su salida por caseta.`,
            url: '/residente',
            tag: `provider-exit-${provider.id}`,
            data: {
              providerId: provider.id,
              type: 'GENERAL_PROVIDER_EXIT',
            },
          });
          notifiedResidentsCount = userIds.length;
        }
      } catch (pushError) {
        this.logger.error(
          `Error enviando push notifications de salida para el proveedor ${provider.name}:`,
          pushError,
        );
      }
    }

    return {
      provider,
      notifiedResidentsCount,
      whatsappMessage,
    };
  }
}
