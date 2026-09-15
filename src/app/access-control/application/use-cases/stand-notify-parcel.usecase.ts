import ParcelDeliveryRepository from '../../domain/repositories/parcel-delivery.repository';
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
  constructor(
    private readonly parcelDeliveryRepository: ParcelDeliveryRepository,
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

    return {
      success: true,
      message,
      whatsappUrl,
      pickupCode: parcel.pickupCode,
    };
  }
}
