import { HouseEntity } from '../entities/house.entity';

export type CreateHouse = Omit<
  HouseEntity,
  'id' | 'createdAt' | 'updatedAt' | 'residents'
>;

export type UpdateHouse = Partial<CreateHouse>;

export type ParamsFindMany = {
  size: number;
  page: number;
  fullText: string;
  condominiumId: string;
  orderBy: 'asc' | 'desc';
};

export default interface HousesRepository {
  create(data: CreateHouse): Promise<HouseEntity>;
  update(id: string, data: UpdateHouse): Promise<HouseEntity>;
  findOneById(id: string): Promise<HouseEntity | null>;
  findOneByNumber(
    number: string,
    condominiumId: string,
  ): Promise<HouseEntity | null>;
  findMany(params: Partial<ParamsFindMany>): Promise<HouseEntity[]>;
  count(params: Partial<ParamsFindMany>): Promise<number>;
  delete(id: string): Promise<void>;
}
