import { ResidentHouse } from './resident-house';

export class HouseEntity {
  id: string;
  condominiumId: string;
  houseNumber: string;
  tower: string;
  residents: ResidentHouse[];
  createdAt: Date;
  updatedAt: Date;
}
