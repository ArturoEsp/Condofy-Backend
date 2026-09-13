export interface AuthUserEntity {
  id: string;
  email: string;
  role: string;
  sessionId: string;
  condominiumId?: string;
  condominiumKey?: string;
}
