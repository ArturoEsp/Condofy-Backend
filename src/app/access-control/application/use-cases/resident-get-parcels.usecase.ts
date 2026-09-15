import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import { ResidentNotFoundException } from '@/app/residents/application/use-cases/create-family-member.usecase';
import { ResidentHouseNotFoundException } from '@/app/residents/application/use-cases/get-my-house.usecase';
import ParcelDeliveryRepository, {
  ParcelsListResult,
} from '../../domain/repositories/parcel-delivery.repository';
import { ParcelStatus } from '@/core/infrastructure/persistence/prisma/generated/client';

export interface ResidentGetParcelsCommand {
  currentUserId: string;
  condominiumId: string;
  status?: ParcelStatus;
  search?: string;
  page?: number;
  size?: number;
}

export class ResidentGetParcelsUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly parcelDeliveryRepository: ParcelDeliveryRepository,
  ) {}

  async execute(
    command: ResidentGetParcelsCommand,
  ): Promise<ParcelsListResult> {
    const resident = await this.residentsRepository.findOneByUserId(
      command.currentUserId,
    );

    if (!resident || resident.condominiumId !== command.condominiumId) {
      throw new ResidentNotFoundException();
    }

    if (!resident.houseId) {
      throw new ResidentHouseNotFoundException();
    }

    return await this.parcelDeliveryRepository.findParcels({
      condominiumId: command.condominiumId,
      houseId: resident.houseId,
      status: command.status,
      search: command.search,
      page: command.page,
      size: command.size,
    });
  }
}
