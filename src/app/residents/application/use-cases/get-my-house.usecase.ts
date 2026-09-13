import ResidentsRepository from '../../domain/repositories/residents.repository';
import HousesRepository from '@/app/houses/domain/repositories/houses.repository';
import { ApplicationException } from '@/core/application/error/application.exception';
import { HouseEntity } from '@/app/houses/domain/entities/house.entity';

export class ResidentHouseNotFoundException extends ApplicationException {
  readonly codeError = 404;
  constructor(message = 'No se encontró la casa asignada al residente.') {
    super(message);
  }
}

export class GetMyHouseUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly housesRepository: HousesRepository,
  ) {}

  async execute(userId: string, condominiumId: string): Promise<HouseEntity> {
    const resident = await this.residentsRepository.findOneByUserId(userId);

    if (!resident || resident.condominiumId !== condominiumId) {
      throw new ResidentHouseNotFoundException(
        'Perfil de residente no encontrado en este condominio.',
      );
    }

    if (!resident.houseId) {
      throw new ResidentHouseNotFoundException(
        'El usuario no tiene una casa asignada.',
      );
    }

    const house = await this.housesRepository.findOneById(resident.houseId);

    if (!house) {
      throw new ResidentHouseNotFoundException('Casa no encontrada.');
    }

    return house;
  }
}
