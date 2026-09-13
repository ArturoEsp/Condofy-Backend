import { UserFindManyArgs } from '@/core/infrastructure/persistence/prisma/generated/models';
import { UserEntity } from '../entities/user.entity';

export type CreateUser = Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>;
export type FindManyUsersFilters = UserFindManyArgs;

export default interface UsersRepository {
  create: (data: CreateUser) => Promise<UserEntity>;
  update: (id: string, data: Partial<CreateUser>) => Promise<UserEntity>;
  findOneByEmail: (email: string) => Promise<UserEntity | null>;
  findOneById: (id: string) => Promise<UserEntity | null>;
  findMany: (filters?: FindManyUsersFilters) => Promise<UserEntity[]>;
  delete: (id: string) => Promise<void>;
}
