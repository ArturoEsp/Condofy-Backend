export interface SendPasswordResetMailParams {
  to: string;
  recipientName?: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface MailService {
  sendPasswordResetEmail(params: SendPasswordResetMailParams): Promise<void>;
}
