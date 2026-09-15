import ParcelDeliveryRepository from '../../domain/repositories/parcel-delivery.repository';
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
  constructor(
    private readonly parcelDeliveryRepository: ParcelDeliveryRepository,
  ) {}

  async execute(
    command: StandRegisterParcelCommand,
  ): Promise<ParcelDeliveryEntity> {
    // Generar PIN aleatorio de 4 dígitos (1000 - 9999)
    const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();

    return await this.parcelDeliveryRepository.create({
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
  }
}
