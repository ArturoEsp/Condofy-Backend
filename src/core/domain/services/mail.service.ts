export interface SendPasswordResetMailParams {
  to: string;
  recipientName?: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface SendNotificationMailParams {
  to: string;
  recipientName?: string;
  condominiumName?: string;
  subject: string;
  title: string;
  message: string;
  details?: Array<{ label: string; value: string }>;
  actionText?: string;
  actionUrl?: string;
}

export interface MailService {
  sendPasswordResetEmail(params: SendPasswordResetMailParams): Promise<void>;
  sendNotificationEmail(params: SendNotificationMailParams): Promise<void>;
}
