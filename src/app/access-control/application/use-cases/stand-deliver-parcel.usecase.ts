import ParcelDeliveryRepository from '../../domain/repositories/parcel-delivery.repository';
import { ParcelDeliveryEntity } from '../../domain/entities/parcel-delivery.entity';
import { ParcelStatus } from '@/core/infrastructure/persistence/prisma/generated/client';
import { ParcelNotFoundException } from '../exceptions/parcel-not-found.exception';
import { ParcelInvalidStatusException } from '../exceptions/parcel-invalid-status.exception';
import { ParcelInvalidCodeException } from '../exceptions/parcel-invalid-code.exception';

export interface StandDeliverParcelCommand {
  condominiumId: string;
  parcelId?: string;
  pickupCode: string;
  deliveredById: string;
  deliveredToName: string;
  deliveryNotes?: string;
}

export class StandDeliverParcelUseCase {
  constructor(
    private readonly parcelDeliveryRepository: ParcelDeliveryRepository,
  ) {}

  async execute(
    command: StandDeliverParcelCommand,
  ): Promise<ParcelDeliveryEntity> {
    let parcel: ParcelDeliveryEntity | null = null;

    if (command.parcelId) {
      parcel = await this.parcelDeliveryRepository.findById(
        command.parcelId,
        command.condominiumId,
      );
    } else if (command.pickupCode) {
      parcel = await this.parcelDeliveryRepository.findByPickupCode(
        command.condominiumId,
        command.pickupCode,
      );
    }

    if (!parcel) {
      throw new ParcelNotFoundException('El paquete no fue encontrado.');
    }

    if (parcel.status !== ParcelStatus.IN_CUSTODY) {
      throw new ParcelInvalidStatusException(
        `El paquete no puede entregarse. Estatus actual: ${parcel.status}.`,
      );
    }

    if (parcel.pickupCode.trim() !== command.pickupCode.trim()) {
      throw new ParcelInvalidCodeException(
        'El código PIN de retiro es incorrecto.',
      );
    }

    return await this.parcelDeliveryRepository.deliver({
      parcelId: parcel.id,
      condominiumId: command.condominiumId,
      deliveredById: command.deliveredById,
      deliveredToName: command.deliveredToName,
      deliveryNotes: command.deliveryNotes,
    });
  }
}
