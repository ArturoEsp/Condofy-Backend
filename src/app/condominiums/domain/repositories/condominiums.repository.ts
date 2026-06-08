import { CondominiumEntity } from '../entities/condominium.entity';

export type CreateCondominium = Omit<
  CondominiumEntity,
  'id' | 'createdAt' | 'updatedAt'
>;

export default interface CondominiumsRepository {
  create(data: CreateCondominium): Promise<CondominiumEntity>;
  update(
    id: string,
    data: Partial<CreateCondominium>,
  ): Promise<CondominiumEntity>;
  findOneById(id: string): Promise<CondominiumEntity | null>;
  findOneByKey(key: string): Promise<CondominiumEntity | null>;
}
