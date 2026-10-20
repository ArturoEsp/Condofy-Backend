import { AmenityEntity, AmenityProps } from '../entities/amenity.entity';
import {
  AmenityBlockPeriodEntity,
  AmenityBlockPeriodProps,
} from '../entities/amenity-block-period.entity';

export interface AmenitiesRepository {
  create(
    data: Omit<
      AmenityProps,
      'id' | 'createdAt' | 'updatedAt' | 'totalReservations'
    >,
  ): Promise<AmenityEntity>;
  update(
    id: string,
    condominiumId: string,
    data: Partial<
      Omit<
        AmenityProps,
        'id' | 'condominiumId' | 'createdAt' | 'updatedAt' | 'totalReservations'
      >
    >,
  ): Promise<AmenityEntity>;
  findById(id: string, condominiumId: string): Promise<AmenityEntity | null>;
  findAll(
    condominiumId: string,
    onlyActive?: boolean,
  ): Promise<AmenityEntity[]>;
  delete(id: string, condominiumId: string): Promise<void>;
  createBlock(
    data: Omit<AmenityBlockPeriodProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<AmenityBlockPeriodEntity>;
  deleteBlock(blockId: string, condominiumId: string): Promise<void>;
  findBlocks(
    amenityId: string,
    condominiumId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AmenityBlockPeriodEntity[]>;
}
