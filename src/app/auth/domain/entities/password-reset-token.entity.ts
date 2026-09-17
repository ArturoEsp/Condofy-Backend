export class PasswordResetTokenEntity {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}
