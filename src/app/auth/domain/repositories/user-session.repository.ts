import { UserSessionEntity } from '../entities/user-session.entity';

export type CreateUserSession = Omit<
  UserSessionEntity,
  'id' | 'createdAt' | 'updatedAt'
>;

export interface SessionWithUser {
  id: string;
  isRevoked: boolean;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    role: string;
    condominiumId?: string | null;
    condominiumKey?: string | null;
  };
}

export default interface UserSessionRepository {
  create(data: CreateUserSession): Promise<UserSessionEntity>;
  update(data: Partial<UserSessionEntity>): Promise<UserSessionEntity>;
  findManyByUserId(userId: string): Promise<UserSessionEntity[]>;
  findById(id: string): Promise<UserSessionEntity>;
  findSessionWithUser(id: string): Promise<SessionWithUser | null>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
