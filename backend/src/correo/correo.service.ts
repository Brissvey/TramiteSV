
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class CorreoService {
  private readonly logger = new Logger(CorreoService.name);
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: Number(this.configService.get<string>('MAIL_PORT') || 587),
      secure: this.configService.get<string>('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async enviarBienvenida(nombre: string, correo: string): Promise<void> {
    const usuarioCorreo = this.configService.get<string>('MAIL_USER');

    if (
      !usuarioCorreo ||
      !this.configService.get<string>('MAIL_PASSWORD')
    ) {
      throw new Error('La configuración SMTP no está completa.');
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:30px 12px;background:#f1f5f9;font-family:Arial,sans-serif;color:#1e293b;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                  style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="background:#123b32;padding:30px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:28px;">TrámiteSV</h1>
                      <p style="color:#d1fae5;font-size:12px;letter-spacing:1px;">
                        BIENVENIDO A NUESTRA PLATAFORMA
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px;">
                      <h2 style="color:#123b32;">¡Hola, ${nombre}!</h2>
                      <p style="font-size:15px;line-height:1.7;">
                        Tu cuenta en TrámiteSV ha sido creada correctamente.
                      </p>
                      <p style="font-size:15px;line-height:1.7;">
                        Ahora puedes organizar tus documentos, consultar información
                        sobre renovaciones y recibir recordatorios de vencimiento.
                      </p>
                      <p style="font-size:15px;line-height:1.7;">
                        Gracias por confiar en nosotros.
                      </p>
                      <p style="margin-top:30px;color:#123b32;font-weight:bold;">
                        ¡Bienvenido a TrámiteSV!
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f8fafc;padding:20px;text-align:center;">
                      <p style="margin:0;color:#475569;font-weight:bold;">TrámiteSV</p>
                      <p style="font-size:11px;color:#64748b;">
                        Este es un mensaje automático. Por favor, no respondas.
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

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM') || usuarioCorreo,
      to: correo,
      subject: '¡Bienvenido a TrámiteSV!',
      text: `Hola ${nombre}, tu cuenta en TrámiteSV ha sido creada correctamente. ¡Bienvenido!`,
      html,
    });

    this.logger.log(`Correo de bienvenida enviado a ${correo}.`);
  }

  async enviarRecuperacionPassword(
    nombre: string,
    correo: string,
    enlace: string,
  ): Promise<void> {
    const usuarioCorreo = this.configService.get<string>('MAIL_USER');

    if (
      !usuarioCorreo ||
      !this.configService.get<string>('MAIL_PASSWORD')
    ) {
      throw new Error('La configuración SMTP no está completa.');
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:30px 12px;background:#f1f5f9;font-family:Arial,sans-serif;color:#1e293b;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                  style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="background:#123b32;padding:30px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:28px;">TrámiteSV</h1>
                      <p style="color:#d1fae5;font-size:12px;">
                        RECUPERACIÓN DE CONTRASEÑA
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px;">
                      <h2 style="color:#123b32;">Hola, ${nombre}</h2>
                      <p style="font-size:15px;line-height:1.7;">
                        Recibimos una solicitud para restablecer la contraseña
                        de tu cuenta en TrámiteSV.
                      </p>
                      <p style="font-size:15px;line-height:1.7;">
                        Haz clic en el siguiente botón para crear una nueva contraseña:
                      </p>
                      <p style="text-align:center;margin:30px 0;">
                        <a href="${enlace}"
                          style="display:inline-block;background:#123b32;color:#ffffff;
                          padding:14px 25px;border-radius:8px;text-decoration:none;
                          font-weight:bold;">
                          Restablecer contraseña
                        </a>
                      </p>
                      <p style="font-size:14px;line-height:1.7;">
                        Este enlace caduca en 15 minutos y solo puede utilizarse una vez.
                      </p>
                      <p style="font-size:13px;color:#64748b;line-height:1.7;">
                        Si no solicitaste este cambio, puedes ignorar este mensaje.
                        Tu contraseña actual seguirá siendo la misma.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f8fafc;padding:20px;text-align:center;">
                      <strong>TrámiteSV</strong>
                      <p style="font-size:11px;color:#64748b;">
                        Este es un mensaje automático. Por favor, no respondas.
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

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM') || usuarioCorreo,
      to: correo,
      subject: 'Recuperación de contraseña - TrámiteSV',
      text: `Hola ${nombre}. Para restablecer tu contraseña ingresa a: ${enlace}. Este enlace caduca en 15 minutos.`,
      html,
    });

    this.logger.log(`Correo de recuperación enviado a ${correo}.`);
  }

}
