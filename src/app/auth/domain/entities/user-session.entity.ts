export class UserSessionEntity {
  id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent: string;
  ip: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
