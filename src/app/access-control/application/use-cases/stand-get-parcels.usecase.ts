import ParcelDeliveryRepository, {
  ParamsFindParcels,
  ParcelsListResult,
} from '../../domain/repositories/parcel-delivery.repository';

export class StandGetParcelsUseCase {
  constructor(
    private readonly parcelDeliveryRepository: ParcelDeliveryRepository,
  ) {}

  async execute(params: ParamsFindParcels): Promise<ParcelsListResult> {
    return await this.parcelDeliveryRepository.findParcels(params);
  }
}
