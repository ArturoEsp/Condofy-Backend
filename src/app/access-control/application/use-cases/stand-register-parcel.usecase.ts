import { Logger } from '@nestjs/common';
import ParcelDeliveryRepository from '../../domain/repositories/parcel-delivery.repository';
import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';
import { ParcelDeliveryEntity } from '../../domain/entities/parcel-delivery.entity';
import { CourierCompany } from '@/core/infrastructure/persistence/prisma/generated/client';

export interface StandRegisterParcelCommand {
  condominiumId: string;
  houseId: string;
  courier: CourierCompany;
  customCourier?: string;
  trackingNumber?: string;
  packageCount?: number;
  photoUrl?: string;
  notes?: string;
  receivedById: string;
}

export class StandRegisterParcelUseCase {
  private readonly logger = new Logger(StandRegisterParcelUseCase.name);

  constructor(
    private readonly parcelDeliveryRepository: ParcelDeliveryRepository,
    private readonly residentsRepository: ResidentsRepository,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(
    command: StandRegisterParcelCommand,
  ): Promise<ParcelDeliveryEntity> {
    // Generar PIN aleatorio de 4 dígitos (1000 - 9999)
    const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();

    const parcel = await this.parcelDeliveryRepository.create({
      condominiumId: command.condominiumId,
      houseId: command.houseId,
      courier: command.courier,
      customCourier: command.customCourier,
      trackingNumber: command.trackingNumber,
      packageCount: command.packageCount ?? 1,
      photoUrl: command.photoUrl,
      notes: command.notes,
      pickupCode,
      receivedById: command.receivedById,
    });

    // Enviar notificación Push a los residentes de la casa
    try {
      const residents = await this.residentsRepository.findManyByHouseId(
        command.houseId,
      );
      const userIds = residents
        .map((resident) => resident.userId)
        .filter(Boolean);

      if (userIds.length > 0) {
        const courierLabel =
          parcel.courier === 'OTHER'
            ? parcel.customCourier || 'Paquetería'
            : parcel.courier.replace(/_/g, ' ');

        const packagesText =
          (parcel.packageCount ?? 1) > 1
            ? ` (${parcel.packageCount} paquetes)`
            : '';

        await this.webPushService.sendNotificationToUsers(userIds, {
          title: '📦 ¡Paquete recibido en caseta!',
          body: `Llegó un paquete de ${courierLabel}${packagesText}. Tu PIN de retiro es: ${parcel.pickupCode}`,
          url: '/residente/dashboard',
          tag: `parcel-${parcel.id}`,
          data: {
            parcelId: parcel.id,
            pickupCode: parcel.pickupCode,
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Error al enviar notificación push de paquete recibido (${parcel.id}):`,
        error,
      );
    }

    return parcel;
  }
}
