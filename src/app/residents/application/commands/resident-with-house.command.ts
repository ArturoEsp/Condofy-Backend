import { ResidentEntity } from '../../domain/entities/resident.entity';

export interface ResidentWithHouse extends ResidentEntity {
  houseNumber: string;
}
