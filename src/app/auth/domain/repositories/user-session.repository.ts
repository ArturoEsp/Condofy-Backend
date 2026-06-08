import { UserSessionEntity } from '../entities/user-session.entity';

export type CreateUserSession = Omit<
  UserSessionEntity,
  'id' | 'createdAt' | 'updatedAt'
>;

export default interface UserSessionRepository {
  create(data: CreateUserSession): Promise<UserSessionEntity>;
  update(data: Partial<UserSessionEntity>): Promise<UserSessionEntity>;
  findManyByUserId(userId: string): Promise<UserSessionEntity[]>;
  findById(id: string): Promise<UserSessionEntity>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
