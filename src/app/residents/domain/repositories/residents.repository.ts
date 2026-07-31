import { ResidentEntity } from '../entities/resident.entity';

export type CreateResident = Omit<
  ResidentEntity,
  'id' | 'createdAt' | 'updatedAt' | 'email' | 'role' | 'status'
> & { userId: string };

export type ParamsFindMany = {
  size: number;
  page: number;
  fullText: string;
  condominiumId: string;
  houseId: string;
  orderBy: 'asc' | 'desc';
};

export default interface ResidentsRepository {
  create(data: CreateResident): Promise<ResidentEntity>;
  update(id: string, data: Partial<CreateResident>): Promise<ResidentEntity>;
  delete(id: string): Promise<void>;
  findOneByUserId(userId: string): Promise<ResidentEntity | null>;
  findManyByHouseId(houseId: string): Promise<ResidentEntity[]>;
  findMany(params: Partial<ParamsFindMany>): Promise<ResidentEntity[]>;
  count(params: Partial<ParamsFindMany>): Promise<number>;
}
