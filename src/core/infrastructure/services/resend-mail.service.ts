import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  MailService,
  SendNotificationMailParams,
  SendPasswordResetMailParams,
} from '@/core/domain/services/mail.service';

@Injectable()
export class ResendMailService implements MailService {
  private readonly logger = new Logger(ResendMailService.name);
  private readonly resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ||
      'Condofy <onboarding@resend.dev>';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn(
        'RESEND_API_KEY no está configurada. Los correos se imprimirán en consola para desarrollo.',
      );
    }
  }

  async sendPasswordResetEmail(
    params: SendPasswordResetMailParams,
  ): Promise<void> {
    const { to, recipientName, resetUrl, expiresInMinutes } = params;
    const greetingName = recipientName ? ` ${recipientName}` : '';

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecimiento de Contraseña - Condofy</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 36px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Condofy</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 600;">¡Hola${greetingName}!</h2>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 15px; line-height: 24px;">
                Has solicitado restablecer tu contraseña para acceder a la plataforma Condofy. Haz clic en el botón siguiente para definir tu nueva contraseña:
              </p>
              <!-- Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                      Restablecer mi contraseña
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Expiration Notice -->
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b; line-height: 20px; background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 0 6px 6px 0;">
                ⏱️ Este enlace es de un solo uso y expirará en <strong>${expiresInMinutes} minutos</strong>.
              </p>
              <!-- Fallback Link -->
              <p style="margin: 20px 0 0 0; font-size: 12px; color: #94a3b8; line-height: 18px; word-break: break-all;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${resetUrl}" style="color: #2563eb; text-decoration: underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 36px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 18px;">
                Si tú no solicitaste este cambio, puedes ignorar este correo con tranquilidad; tu cuenta sigue protegida.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    if (!this.resend) {
      this.logger.log(
        `[DEV MODE - Email Simulation] A: ${to} | Enlace de restablecimiento: ${resetUrl}`,
      );
      return;
    }

    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Restablece tu contraseña - Condofy',
        html: htmlContent,
      });

      if (response.error) {
        this.logger.error(
          `Error al enviar correo con Resend a ${to}: ${response.error.message}`,
        );
        throw new Error(`Resend error: ${response.error.message}`);
      }

      this.logger.log(
        `Correo de restablecimiento enviado exitosamente a ${to} (ID: ${response.data?.id})`,
      );
    } catch (err: any) {
      this.logger.error(
        `Fallo en el servicio de correo al enviar a ${to}: ${err.message}`,
      );
      throw err;
    }
  }

  async sendNotificationEmail(
    params: SendNotificationMailParams,
  ): Promise<void> {
    const {
      to,
      recipientName,
      condominiumName,
      subject,
      title,
      message,
      details,
      actionText,
      actionUrl,
    } = params;
    const greetingName = recipientName ? ` ${recipientName}` : '';
    const condo = condominiumName || 'Condofy';

    const detailsHtml =
      details && details.length > 0
        ? `
      <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 14px;">
        ${details
          .map(
            (d) => `
          <tr>
            <td style="color: #64748b; font-weight: 600; width: 40%; border-bottom: 1px solid #f1f5f9;">${d.label}:</td>
            <td style="color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9;">${d.value}</td>
          </tr>
        `,
          )
          .join('')}
      </table>
    `
        : '';

    const actionButtonHtml =
      actionUrl && actionText
        ? `
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 10px 0;">
        <tr>
          <td align="center">
            <a href="${actionUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
              ${actionText}
            </a>
          </td>
        </tr>
      </table>
    `
        : '';

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">${condo}</h1>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">Notificación de Cobranza y Cuotas</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px; font-weight: 700;">¡Hola${greetingName}!</h2>
              <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 24px; font-weight: 600;">
                ${title}
              </p>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 22px;">
                ${message}
              </p>

              ${detailsHtml}
              ${actionButtonHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 18px;">
                Este es un mensaje institucional de ${condo} gestionado mediante la plataforma Condofy.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    if (!this.resend) {
      this.logger.log(
        `[DEV MODE - Email Simulation] A: ${to} | Asunto: ${subject} | ${title}`,
      );
      return;
    }

    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `${condo}: ${subject}`,
        html: htmlContent,
      });

      if (response.error) {
        this.logger.error(
          `Error al enviar notificación Resend a ${to}: ${response.error.message}`,
        );
        return;
      }

      this.logger.log(
        `Notificación enviada por correo a ${to} (ID: ${response.data?.id})`,
      );
    } catch (err: any) {
      this.logger.error(
        `Fallo al enviar notificación por correo a ${to}: ${err.message}`,
      );
    }
  }
}
