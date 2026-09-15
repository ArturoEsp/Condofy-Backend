import ParcelDeliveryRepository, {
  ParcelStatsResult,
} from '../../domain/repositories/parcel-delivery.repository';

export class StandGetParcelStatsUseCase {
  constructor(
    private readonly parcelDeliveryRepository: ParcelDeliveryRepository,
  ) {}

  async execute(condominiumId: string): Promise<ParcelStatsResult> {
    return await this.parcelDeliveryRepository.getStats(condominiumId);
  }
}
