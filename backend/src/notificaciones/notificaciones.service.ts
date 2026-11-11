
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { DatabaseService } from '../database/database.service';

interface DocumentoRegistradoEvent {
  documentoId: number;
  usuarioId: number;
  tipo: string;
  fechaVencimiento: string;
  diasAnticipacion: number;
}

interface DocumentoPorVencer {
  documento_id: number;
  tipo: string;
  fecha_vencimiento: string | Date;
  dias_anticipacion: number;
  nombre: string;
  correo: string;
  dias_restantes: number;
}

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);
  private readonly transporter: Transporter;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
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

  @OnEvent('DOCUMENTO_REGISTRADO')
  async alRegistrarDocumento(evento: DocumentoRegistradoEvent) {
    this.logger.log(
      `DOCUMENTO_REGISTRADO recibido: documento ${evento.documentoId}`,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async revisarDocumentosPorVencer() {
    const conexion = await this.databaseService.getConnection();

    try {
      const [filas] = await conexion.execute(`
        SELECT
          d.id AS documento_id,
          d.tipo,
          d.fecha_vencimiento,
          d.dias_anticipacion,
          u.nombre,
          u.correo,
          DATEDIFF(d.fecha_vencimiento, CURDATE()) AS dias_restantes
        FROM documentos d
        INNER JOIN usuarios u ON u.id = d.usuario_id
        WHERE DATEDIFF(d.fecha_vencimiento, CURDATE()) = d.dias_anticipacion
          AND NOT EXISTS (
            SELECT 1
            FROM recordatorios_enviados r
            WHERE r.documento_id = d.id
              AND r.fecha_vencimiento = d.fecha_vencimiento
              AND r.dias_anticipacion = d.dias_anticipacion
              AND r.estado = 'ENVIADO'
          )
      `);

      const documentos = filas as DocumentoPorVencer[];

      for (const documento of documentos) {
        await this.eventEmitter.emitAsync(
          'DOCUMENTO_POR_VENCER',
          documento,
        );
      }

      this.logger.log(
        `Revisión terminada: ${documentos.length} recordatorio(s) pendiente(s).`,
      );
    } catch (error) {
      this.logger.error(
        'Error al revisar documentos por vencer',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      conexion.release();
    }
  }

  @OnEvent('DOCUMENTO_POR_VENCER')
  async alDetectarDocumentoPorVencer(documento: DocumentoPorVencer) {
    await this.enviarRecordatorio(documento);
  }


  private async enviarRecordatorio(documento: DocumentoPorVencer) {
    const usuarioCorreo = this.configService.get<string>('MAIL_USER');
    const usuarioPassword = this.configService.get<string>('MAIL_PASSWORD');

    if (!usuarioCorreo || !usuarioPassword) {
      this.logger.warn(
        'Correo no configurado. Revisa MAIL_USER y MAIL_PASSWORD en .env.',
      );
      return;
    }

    const conexion = await this.databaseService.getConnection();

    try {
      const fecha = this.fechaSQL(documento.fecha_vencimiento);

      const [resultado] = await conexion.execute(
        `INSERT IGNORE INTO recordatorios_enviados
          (documento_id, fecha_vencimiento, dias_anticipacion, estado)
         VALUES (?, ?, ?, 'PENDIENTE')`,
        [
          documento.documento_id,
          fecha,
          documento.dias_anticipacion,
        ],
      );

      const insertados = (
        resultado as { affectedRows: number }
      ).affectedRows;

      if (insertados === 0) {
        this.logger.log(
          `Recordatorio ya reservado para el documento ${documento.documento_id}.`,
        );
        return;
      }

      const tipoNormalizado = documento.tipo
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

      let asunto = `Recordatorio TrámiteSV: ${documento.tipo} próximo a vencer`;
      let titulo = 'Tu documento está próximo a vencer';
      let descripcion =
        'Te recomendamos revisar los requisitos de renovación con la institución correspondiente.';
      let enlace = 'https://dui.gob.sv/';
      let textoEnlace = 'Consultar portal oficial';

      if (tipoNormalizado.includes('dui')) {
        asunto = 'TrámiteSV | Tu DUI está próximo a vencer';
        titulo = 'Tu DUI está próximo a vencer';
        descripcion =
          'Mantén tu Documento Único de Identidad al día. Consulta la información oficial para conocer los pasos que debes seguir.';
        enlace = 'https://dui.gob.sv/';
        textoEnlace = 'Consultar portal oficial del DUI';
      }


      const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${titulo}</title>
        </head>
        <body style="margin:0;padding:30px 12px;background-color:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
          <div style="display:none;max-height:0;overflow:hidden;">
            Recuerda revisar la fecha de vencimiento de tu documento.
          </div>
    
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                  style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
    
                  <tr>
                    <td style="background-color:#123b32;padding:28px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:28px;">TrámiteSV</h1>
                      <p style="margin:8px 0 0;color:#d1fae5;font-size:12px;letter-spacing:1px;">
                        RECORDATORIO DE VENCIMIENTO
                      </p>
                    </td>
                  </tr>
    
                  <tr>
                    <td style="padding:30px;">
                      <h2 style="margin:0 0 14px;color:#123b32;font-size:23px;">
                        ${titulo}
                      </h2>
    
                      <p style="font-size:15px;line-height:1.7;margin:0 0 20px;">
                        Hola ${documento.nombre},
                      </p>
    
                      <p style="font-size:15px;line-height:1.7;margin:0 0 22px;">
                        ${descripcion}
                      </p>
    
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                        style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
                        <tr>
                          <td style="padding:20px;">
                            <p style="margin:0 0 6px;color:#64748b;font-size:12px;">DOCUMENTO</p>
                            <p style="margin:0 0 18px;color:#123b32;font-size:18px;font-weight:bold;">
                              ${documento.tipo}
                            </p>
    
                            <p style="margin:0 0 6px;color:#64748b;font-size:12px;">FECHA DE VENCIMIENTO</p>
                            <p style="margin:0 0 18px;color:#1e293b;font-size:16px;font-weight:bold;">
                              ${fecha}
                            </p>
    
                            <p style="margin:0 0 6px;color:#64748b;font-size:12px;">DÍAS RESTANTES</p>
                            <p style="margin:0;color:#166534;font-size:24px;font-weight:bold;">
                              ${documento.dias_restantes} días
                            </p>
                          </td>
                        </tr>
                      </table>
    
                      <p style="font-size:14px;line-height:1.7;margin:24px 0;">
                        Para obtener información actualizada sobre tu trámite, visita el portal oficial.
                      </p>
    
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
                        <tr>
                          <td align="center" style="background-color:#166534;border-radius:6px;">
                            <a href="${enlace}" target="_blank"
                              style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;">
                              ${textoEnlace}
                            </a>
                          </td>
                        </tr>
                      </table>
    
                      <p style="font-size:12px;line-height:1.6;color:#64748b;margin:24px 0 0;">
                        Verifica los requisitos y las condiciones directamente con la institución oficial, ya que pueden cambiar.
                      </p>
                    </td>
                  </tr>
    
                  <tr>
                    <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 25px;text-align:center;">
                      <p style="margin:0;color:#475569;font-size:13px;font-weight:bold;">
                        TrámiteSV
                      </p>
                      <p style="margin:7px 0 0;color:#64748b;font-size:11px;">
                        Este es un mensaje automático. Por favor, no respondas a este correo.
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
    

      const texto = [
        `Hola ${documento.nombre},`,
        '',
        titulo,
        `Documento: ${documento.tipo}`,
        `Fecha de vencimiento: ${fecha}`,
        `Días restantes: ${documento.dias_restantes}`,
        '',
        descripcion,
        `Portal oficial: ${enlace}`,
        '',
        'Este es un mensaje automático de TrámiteSV.',
      ].join('\n');

      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM') || usuarioCorreo,
        to: documento.correo,
        subject: asunto,
        text: texto,
        html,
      });

      await conexion.execute(
        `UPDATE recordatorios_enviados
         SET estado = 'ENVIADO'
         WHERE documento_id = ?
           AND fecha_vencimiento = ?
           AND dias_anticipacion = ?`,
        [
          documento.documento_id,
          fecha,
          documento.dias_anticipacion,
        ],
      );

      this.logger.log(
        `Recordatorio enviado a ${documento.correo} para el documento ${documento.documento_id}.`,
      );
    } catch (error) {
      this.logger.error(
        `Falló el envío del recordatorio del documento ${documento.documento_id}.`,
        error instanceof Error ? error.stack : String(error),
      );

      await conexion.execute(
        `DELETE FROM recordatorios_enviados
         WHERE documento_id = ?
           AND fecha_vencimiento = ?
           AND dias_anticipacion = ?
           AND estado = 'PENDIENTE'`,
        [
          documento.documento_id,
          this.fechaSQL(documento.fecha_vencimiento),
          documento.dias_anticipacion,
        ],
      );
    } finally {
      conexion.release();
    }
  }


  private fechaSQL(fecha: string | Date): string {
    if (typeof fecha === 'string') {
      return fecha.slice(0, 10);
    }

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}-${mes}-${dia}`;
  }
}
