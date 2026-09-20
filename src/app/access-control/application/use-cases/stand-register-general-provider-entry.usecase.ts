import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { UserStatus } from '@/core/infrastructure/persistence/prisma/generated/enums';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';
import {
  GeneralProviderAccessEntity,
  GeneralProviderCategory,
} from '../../domain/entities/general-provider-access.entity';
import { GeneralProvidersRepository } from '../../domain/repositories/general-providers.repository';

export interface StandRegisterGeneralProviderEntryDto {
  condominiumId: string;
  entryGuardId: string;
  name: string;
  category: GeneralProviderCategory;
  driverName?: string;
  vehiclePlate?: string;
  companyPhone?: string;
  notes?: string;
  notifyResidents?: boolean;
}

export interface StandRegisterGeneralProviderEntryResult {
  provider: GeneralProviderAccessEntity;
  notifiedResidentsCount: number;
  whatsappMessage: string;
}

@Injectable()
export class StandRegisterGeneralProviderEntryUseCase {
  private readonly logger = new Logger(
    StandRegisterGeneralProviderEntryUseCase.name,
  );

  constructor(
    private readonly generalProvidersRepository: GeneralProvidersRepository,
    private readonly prismaService: PrismaService,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(
    dto: StandRegisterGeneralProviderEntryDto,
  ): Promise<StandRegisterGeneralProviderEntryResult> {
    const provider = await this.generalProvidersRepository.create({
      condominiumId: dto.condominiumId,
      name: dto.name,
      category: dto.category,
      driverName: dto.driverName,
      vehiclePlate: dto.vehiclePlate,
      companyPhone: dto.companyPhone,
      notes: dto.notes,
      entryGuardId: dto.entryGuardId,
    });

    const categoryEmoji = this.getCategoryEmoji(dto.category);
    const categoryLabel = this.getCategoryLabel(dto.category);

    const whatsappMessage = `*Aviso de Caseta:* Ha ingresado el proveedor *${provider.name}* (${categoryLabel})${
      provider.vehiclePlate ? ` - Placas: ${provider.vehiclePlate}` : ''
    }. Ya se encuentra disponible en el condominio.`;

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
            title: `${categoryEmoji} ${provider.name} en el condominio`,
            body: `Ha ingresado ${provider.name}${
              provider.vehiclePlate
                ? ` (Vehículo: ${provider.vehiclePlate})`
                : ''
            }. Ya puedes solicitar tu servicio.`,
            url: '/residente',
            tag: `provider-entry-${provider.id}`,
            data: {
              providerId: provider.id,
              type: 'GENERAL_PROVIDER_ENTRY',
            },
          });
          notifiedResidentsCount = userIds.length;
        }
      } catch (pushError) {
        this.logger.error(
          `Error enviando push notifications a residentes para el proveedor ${provider.name}:`,
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

  private getCategoryEmoji(category: GeneralProviderCategory): string {
    switch (category) {
      case GeneralProviderCategory.WATER:
        return '💧';
      case GeneralProviderCategory.GAS:
        return '🚛';
      case GeneralProviderCategory.GARDENING:
        return '🌿';
      case GeneralProviderCategory.TRASH:
        return '🗑️';
      case GeneralProviderCategory.MAINTENANCE:
        return '🛠️';
      default:
        return '🚚';
    }
  }

  private getCategoryLabel(category: GeneralProviderCategory): string {
    switch (category) {
      case GeneralProviderCategory.WATER:
        return 'Agua Purificada';
      case GeneralProviderCategory.GAS:
        return 'Gas LP';
      case GeneralProviderCategory.GARDENING:
        return 'Jardinería';
      case GeneralProviderCategory.TRASH:
        return 'Recolección de Basura';
      case GeneralProviderCategory.MAINTENANCE:
        return 'Mantenimiento';
      default:
        return 'Proveedor General';
    }
  }
}
