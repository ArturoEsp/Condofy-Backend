import { Logger } from '@nestjs/common';
import ParcelDeliveryRepository from '../../domain/repositories/parcel-delivery.repository';
import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import { WebPushService } from '@/app/notifications/infrastructure/services/web-push.service';
import { ParcelNotFoundException } from '../exceptions/parcel-not-found.exception';

export interface StandNotifyParcelCommand {
  condominiumId: string;
  parcelId: string;
  recipientPhone?: string;
  condominiumName?: string;
}

export interface StandNotifyParcelResult {
  success: boolean;
  message: string;
  whatsappUrl?: string;
  pickupCode: string;
}

export class StandNotifyParcelUseCase {
  private readonly logger = new Logger(StandNotifyParcelUseCase.name);

  constructor(
    private readonly parcelDeliveryRepository: ParcelDeliveryRepository,
    private readonly residentsRepository: ResidentsRepository,
    private readonly webPushService: WebPushService,
  ) {}

  async execute(
    command: StandNotifyParcelCommand,
  ): Promise<StandNotifyParcelResult> {
    const parcel = await this.parcelDeliveryRepository.findById(
      command.parcelId,
      command.condominiumId,
    );

    if (!parcel) {
      throw new ParcelNotFoundException('El paquete no fue encontrado.');
    }

    await this.parcelDeliveryRepository.markNotified(parcel.id);

    const courierLabel =
      parcel.courier === 'OTHER'
        ? parcel.customCourier || 'Paquetería'
        : parcel.courier.replace('_', ' ');

    const houseLabel = parcel.house?.houseNumber
      ? `Casa ${parcel.house.houseNumber}${parcel.house.tower ? ` Torre ${parcel.house.tower}` : ''}`
      : 'tu domicilio';

    const condoLabel = command.condominiumName
      ? ` en ${command.condominiumName}`
      : '';

    const trackingInfo = parcel.trackingNumber
      ? ` (Guía: ${parcel.trackingNumber})`
      : '';

    const message =
      `📦 *Paquete Recibido en Caseta${condoLabel}*\n\n` +
      `Hola! Te informamos que recibimos un paquete de *${courierLabel}*${trackingInfo} para *${houseLabel}*.\n\n` +
      `🔐 *PIN de Retiro:* *${parcel.pickupCode}*\n` +
      `📦 *Bultos:* ${parcel.packageCount}\n\n` +
      `Favor de acudir a caseta con este PIN para entregarte tu paquete de forma segura.`;

    let whatsappUrl: string | undefined = undefined;
    if (command.recipientPhone) {
      const cleanPhone = command.recipientPhone.replace(/\D/g, '');
      if (cleanPhone.length >= 10) {
        whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(message)}`;
      }
    }

    // Enviar notificación Push adicionalmente a los residentes de la casa
    try {
      const residents = await this.residentsRepository.findManyByHouseId(
        parcel.houseId,
      );
      const userIds = residents
        .map((resident) => resident.userId)
        .filter(Boolean);

      if (userIds.length > 0) {
        const packagesText =
          (parcel.packageCount ?? 1) > 1
            ? ` (${parcel.packageCount} paquetes)`
            : '';

        await this.webPushService.sendNotificationToUsers(userIds, {
          title: '📦 ¡Paquete listo para entrega en caseta!',
          body: `Aviso de caseta: Tu paquete de ${courierLabel}${packagesText} te espera. Tu PIN de retiro es: ${parcel.pickupCode}`,
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
        `Error al enviar notificación push de aviso de paquete (${parcel.id}):`,
        error,
      );
    }

    return {
      success: true,
      message,
      whatsappUrl,
      pickupCode: parcel.pickupCode,
    };
  }
}
