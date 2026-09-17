import { PasswordResetTokenEntity } from '../entities/password-reset-token.entity';

export type CreatePasswordResetToken = {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
};

export default interface PasswordResetTokensRepository {
  create(data: CreatePasswordResetToken): Promise<PasswordResetTokenEntity>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetTokenEntity | null>;
  markAsUsed(id: string): Promise<void>;
  invalidateAllPendingForUser(userId: string): Promise<void>;
}
