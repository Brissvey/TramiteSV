import { Injectable, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { DatabaseService } from '../database/database.service';

type TipoRecordatorio = 'VENCIMIENTO' | 'CORTE' | 'PAGO';

interface DocumentoRegistradoEvent {
  documentoId: number;
  usuarioId: number;
  tipo: string;
  fechaVencimiento: string;
  diasAnticipacion: number;
}

interface DocumentoBase {
  documento_id: number;
  tipo: string;
  fecha_vencimiento: string | Date;
  dias_anticipacion: number;
  dia_corte: number | null;
  dia_pago: number | null;
  nombre: string;
  correo: string;
}

interface DocumentoPorVencer extends DocumentoBase {
  fecha_recordatorio: string;
  dias_restantes: number;
  tipo_recordatorio: TipoRecordatorio;
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
  private obtenerRequisitos(tipo: string): string[] {
    const tipoNormalizado = tipo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    if (tipoNormalizado.includes('dui')) {
      return [
        'Presentar el DUI anterior.',
        'Realizar el pago correspondiente de $10.31.',
      ];
    }

    if (tipoNormalizado.includes('pasaporte')) {
      return [
        'Presentar DUI original vigente.',
        'Presentar el pasaporte anterior, aunque esté vencido o próximo a vencer.',
        'Presentar comprobante de pago de $25.00, realizado en caja o en línea.',
      ];
    }

    if (tipoNormalizado.includes('licencia')) {
      return [
        'Presentar licencia anterior original.',
        'Presentar DUI original vigente.',
        'Aprobar el examen visual.',
        'No tener multas de tránsito pendientes.',
      ];
    }

    if (tipoNormalizado.includes('circulacion')) {
      return [
        'Presentar tarjeta de circulación anterior.',
        'Presentar DUI original vigente de la persona que realiza el trámite.',
        'No tener multas pendientes.',
      ];
    }

    return [];
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
      const [filasHoy] = await conexion.execute(
        'SELECT DATE_FORMAT(CURDATE(), "%Y-%m-%d") AS hoy',
      );
      const hoy = this.fechaSQL(
        (filasHoy as Array<{ hoy: string }>)[0].hoy,
      );

      const [filas] = await conexion.execute(`
        SELECT
          d.id AS documento_id,
          d.tipo,
          d.fecha_vencimiento,
          d.dias_anticipacion,
          d.dia_corte,
          d.dia_pago,
          u.nombre,
          u.correo
        FROM documentos d
        INNER JOIN usuarios u ON u.id = d.usuario_id
      `);

      const documentos = filas as DocumentoBase[];
      let pendientes = 0;

      for (const documento of documentos) {
        const fechaVencimiento = this.fechaSQL(documento.fecha_vencimiento);
        const diasParaVencer = this.diasEntre(hoy, fechaVencimiento);

        if (documento.tipo === 'Tarjeta de crédito') {
          // Vencimiento físico de la tarjeta.
          for (const dias of [30, 21, 14, 7, 1]) {
            if (diasParaVencer === dias) {
              await this.eventEmitter.emitAsync('DOCUMENTO_POR_VENCER', {
                ...documento,
                fecha_recordatorio: fechaVencimiento,
                dias_restantes: dias,
                tipo_recordatorio: 'VENCIMIENTO' as TipoRecordatorio,
              } satisfies DocumentoPorVencer);
              pendientes++;
            }
          }

          // Corte mensual: un aviso el día anterior.
          if (documento.dia_corte) {
            const fechaCorte = this.proximaFechaMensual(documento.dia_corte, hoy);
            const diasParaCorte = this.diasEntre(hoy, fechaCorte);

            if (diasParaCorte === 1) {
              await this.eventEmitter.emitAsync('DOCUMENTO_POR_VENCER', {
                ...documento,
                fecha_recordatorio: fechaCorte,
                dias_restantes: 1,
                tipo_recordatorio: 'CORTE' as TipoRecordatorio,
              } satisfies DocumentoPorVencer);
              pendientes++;
            }
          }

          // Pago mensual: 30, 21, 14, 7 y 1 día antes.
          if (documento.dia_pago) {
            const fechaPago = this.proximaFechaMensual(documento.dia_pago, hoy);
            const diasParaPago = this.diasEntre(hoy, fechaPago);

            for (const dias of [30, 21, 14, 7, 1]) {
              if (diasParaPago === dias) {
                await this.eventEmitter.emitAsync('DOCUMENTO_POR_VENCER', {
                  ...documento,
                  fecha_recordatorio: fechaPago,
                  dias_restantes: dias,
                  tipo_recordatorio: 'PAGO' as TipoRecordatorio,
                } satisfies DocumentoPorVencer);
                pendientes++;
              }
            }
          }
        } else {
          // Se conserva el comportamiento de los documentos existentes.
          const intervalos = new Set([documento.dias_anticipacion, 1]);

          for (const dias of intervalos) {
            if (diasParaVencer === dias) {
              await this.eventEmitter.emitAsync('DOCUMENTO_POR_VENCER', {
                ...documento,
                fecha_recordatorio: fechaVencimiento,
                dias_restantes: dias,
                tipo_recordatorio: 'VENCIMIENTO' as TipoRecordatorio,
              } satisfies DocumentoPorVencer);
              pendientes++;
            }
          }
        }
      }

      this.logger.log(
        `Revisión terminada: ${pendientes} recordatorio(s) detectado(s).`,
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
    const fecha = this.fechaSQL(documento.fecha_recordatorio);
    const tipoRecordatorio = documento.tipo_recordatorio;

    try {
      // La clave única distingue VENCIMIENTO, CORTE y PAGO.
      const [resultado] = await conexion.execute(
        `INSERT IGNORE INTO recordatorios_enviados
          (documento_id, fecha_vencimiento, dias_anticipacion, tipo_recordatorio, estado)
         VALUES (?, ?, ?, ?, 'PENDIENTE')`,
        [
          documento.documento_id,
          fecha,
          documento.dias_restantes,
          tipoRecordatorio,
        ],
      );

      const insertados = (
        resultado as { affectedRows: number }
      ).affectedRows;

      if (insertados === 0) {
        this.logger.log(
          `Recordatorio ${tipoRecordatorio} ya reservado para documento ${documento.documento_id}, fecha ${fecha}.`,
        );
        return;
      }

      let asunto = `TrámiteSV | Recordatorio de ${documento.tipo}`;
      let titulo = `Recordatorio de ${documento.tipo}`;
      let descripcion = `Te recordamos revisar la información de tu ${documento.tipo}.`;
      let etiquetaFecha = 'FECHA';
      let etiquetaDias = 'DÍAS RESTANTES';
      let colorFondo = '#f0fdf4';
      let colorBorde = '#bbf7d0';
      let colorTexto = '#166534';
      let enlace = 'https://dui.sv/inicio/';
      let textoEnlace = 'Consultar portal oficial';
      const requisitos =
        tipoRecordatorio === 'VENCIMIENTO'
          ? this.obtenerRequisitos(documento.tipo)
          : [];

      const htmlRequisitos = requisitos.length
        ? `
          <div style="margin:24px 0;padding:18px;background-color:#f8fafc;border-radius:8px;">
            <h3 style="margin:0 0 12px;color:#123b32;font-size:17px;">
              Requisitos para la renovación
            </h3>
            <ul style="margin:0;padding-left:22px;">
              ${requisitos.map((requisito) => `
                <li style="margin-bottom:8px;font-size:14px;line-height:1.6;">
                  ${requisito}
                </li>
              `).join('')}
            </ul>
          </div>
        `
        : '';

      const htmlInformacion = requisitos.length > 0
        ? `<p style="font-size:14px;line-height:1.7;margin:24px 0;">Consulta las ubicaciones y los detalles del trámite directamente en la aplicación TrámiteSV.</p>`
        : `<p style="font-size:14px;line-height:1.7;margin:24px 0;">Para obtener información actualizada, consulta directamente con la institución correspondiente.</p>`;

      if (tipoRecordatorio === 'CORTE') {
        asunto = 'TrámiteSV | Mañana es el corte de tu tarjeta';
        titulo = 'Mañana es el corte de tu tarjeta';
        descripcion =
          'Te avisamos que mañana corresponde el corte mensual de tu tarjeta de crédito. Revisa tus movimientos y tu estado de cuenta con tu banco.';
        etiquetaFecha = 'FECHA DE CORTE';
        etiquetaDias = 'DÍAS PARA EL CORTE';
        colorFondo = '#f5f3ff';
        colorBorde = '#ddd6fe';
        colorTexto = '#6d28d9';
        enlace = 'https://www.ssf.gob.sv/';
        textoEnlace = 'Consultar información financiera';
      } else if (tipoRecordatorio === 'PAGO') {
        asunto = `TrámiteSV | Tu pago vence en ${documento.dias_restantes} día(s)`;
        titulo = 'Próxima fecha de pago de tu tarjeta';
        descripcion =
          `Tu fecha de pago mensual será el ${fecha}. Revisa el monto y las condiciones de pago directamente con tu banco para evitar cargos por mora.`;
        etiquetaFecha = 'FECHA LÍMITE DE PAGO';
        etiquetaDias = 'DÍAS PARA EL PAGO';
        colorFondo = '#fff7ed';
        colorBorde = '#fed7aa';
        colorTexto = '#c2410c';
        enlace = 'https://www.ssf.gob.sv/';
        textoEnlace = 'Consultar información financiera';
      } else if (documento.tipo === 'Tarjeta de crédito') {
        asunto = `TrámiteSV | Tu tarjeta vence en ${documento.dias_restantes} día(s)`;
        titulo = 'Tu tarjeta de crédito está próxima a vencer';
        descripcion =
          'Verifica la fecha de vencimiento de tu tarjeta y comunícate con tu banco para conocer el proceso de renovación.';
        etiquetaFecha = 'VENCIMIENTO DE LA TARJETA';
        enlace = 'https://www.ssf.gob.sv/';
        textoEnlace = 'Consultar información financiera';
      } else {
        const tipoNormalizado = documento.tipo
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim();

        if (tipoNormalizado.includes('dui')) {
          asunto = 'TrámiteSV | Tu DUI está próximo a vencer';
          titulo = 'Tu DUI está próximo a vencer';
          descripcion =
            'Mantén tu Documento Único de Identidad al día. Consulta los requisitos para realizar la renovación.';
          enlace = 'https://dui.sv/inicio/';
          textoEnlace = 'Consultar portal oficial del DUI';
        } else if (tipoNormalizado.includes('licencia')) {
          enlace = 'https://portal.sertracen.com.sv/refrenda_licencia/';
          textoEnlace = 'Consultar refrenda de licencia';
        } else if (tipoNormalizado.includes('circulacion')) {
          enlace = 'https://portal.sertracen.com.sv/refrenda_tarjeta/';
          textoEnlace = 'Consultar refrenda de tarjeta';
        } else if (tipoNormalizado.includes('pasaporte')) {
          enlace = '';
          textoEnlace = '';
        }

        if (documento.dias_restantes === 1) {
          asunto = `TrámiteSV | Mañana vence tu ${documento.tipo}`;
          titulo = `¡Mañana vence tu ${documento.tipo}!`;
          descripcion =
            `Te recordamos que mañana vence tu ${documento.tipo}. Te recomendamos realizar el trámite de renovación lo antes posible.`;
        }
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
          <div style="display:none;max-height:0;overflow:hidden;">${descripcion}</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background-color:#123b32;padding:28px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;">TrámiteSV</h1>
                    <p style="margin:8px 0 0;color:#d1fae5;font-size:12px;letter-spacing:1px;">RECORDATORIO AUTOMÁTICO</p>
                  </td>
                </tr>
                <tr><td style="padding:30px;">
                  <h2 style="margin:0 0 14px;color:#123b32;font-size:23px;">${titulo}</h2>
                  <p style="font-size:15px;line-height:1.7;margin:0 0 20px;">Hola ${documento.nombre},</p>
                  <p style="font-size:15px;line-height:1.7;margin:0 0 22px;">${descripcion}</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                    style="background-color:${colorFondo};border:1px solid ${colorBorde};border-radius:8px;">
                    <tr><td style="padding:20px;">
                      <p style="margin:0 0 6px;color:#64748b;font-size:12px;">DOCUMENTO</p>
                      <p style="margin:0 0 18px;color:#123b32;font-size:18px;font-weight:bold;">${documento.tipo}</p>
                      <p style="margin:0 0 6px;color:#64748b;font-size:12px;">${etiquetaFecha}</p>
                      <p style="margin:0 0 18px;color:#1e293b;font-size:16px;font-weight:bold;">${fecha}</p>
                      <p style="margin:0 0 6px;color:#64748b;font-size:12px;">${etiquetaDias}</p>
                      <p style="margin:0;color:${colorTexto};font-size:24px;font-weight:bold;">${documento.dias_restantes} día(s)</p>
                    </td></tr>
                  </table>
                  ${htmlRequisitos}
                  ${htmlInformacion}
                  ${enlace ? `
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
                      <tr><td align="center" style="background-color:#166534;border-radius:6px;">
                        <a href="${enlace}" target="_blank"
                          style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;">
                          ${textoEnlace}
                        </a>
                      </td></tr>
                    </table>
                  ` : ''}
                  <p style="font-size:12px;line-height:1.6;color:#64748b;margin:24px 0 0;">
                    Verifica los requisitos y condiciones directamente con la institución oficial, ya que pueden cambiar.
                  </p>
                </td></tr>
                <tr><td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 25px;text-align:center;">
                  <p style="margin:0;color:#475569;font-size:13px;font-weight:bold;">TrámiteSV</p>
                  <p style="margin:7px 0 0;color:#64748b;font-size:11px;">Este es un mensaje automático. Por favor, no respondas a este correo.</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>`;

      const texto = [
        `Hola ${documento.nombre},`,
        '',
        titulo,
        `Documento: ${documento.tipo}`,
        `${etiquetaFecha}: ${fecha}`,
        `${etiquetaDias}: ${documento.dias_restantes}`,
        '',
        descripcion,
        ...(requisitos.length > 0
          ? [
              '',
              'REQUISITOS PARA LA RENOVACIÓN:',
              ...requisitos.map((requisito) => `- ${requisito}`),
              '',
              'Consulta las ubicaciones y los detalles del trámite en la aplicación TrámiteSV.',
              ...(enlace ? [`Información oficial: ${enlace}`] : []),
            ]
          : [`Información: ${enlace}`]),
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
          AND dias_anticipacion = ?
          AND tipo_recordatorio = ?`,
        [
          documento.documento_id,
          fecha,
          documento.dias_restantes,
          tipoRecordatorio,
        ],
      );

      this.logger.log(
        `Recordatorio ${tipoRecordatorio} enviado a ${documento.correo} para documento ${documento.documento_id}.`,
      );
    } catch (error) {
      this.logger.error(
        `Falló el envío del recordatorio ${tipoRecordatorio} del documento ${documento.documento_id}.`,
        error instanceof Error ? error.stack : String(error),
      );

      await conexion.execute(
        `DELETE FROM recordatorios_enviados
        WHERE documento_id = ?
          AND fecha_vencimiento = ?
          AND dias_anticipacion = ?
          AND tipo_recordatorio = ?
          AND estado = 'PENDIENTE'`,
        [
          documento.documento_id,
          fecha,
          documento.dias_restantes,
          tipoRecordatorio,
        ],
      );
    } finally {
      conexion.release();
    }
  }

  /** Próxima fecha mensual; los días 29, 30 y 31 se ajustan al fin de mes. */
  private proximaFechaMensual(dia: number, hoy: string): string {
    const [anioActual, mesActual] = hoy.split('-').map(Number);
    let anio = anioActual;
    let mes = mesActual;

    let fecha = this.crearFechaMensual(anio, mes, dia);

    if (this.diasEntre(hoy, fecha) <= 0) {
      mes += 1;
      if (mes > 12) {
        mes = 1;
        anio += 1;
      }
      fecha = this.crearFechaMensual(anio, mes, dia);
    }

    return fecha;
  }

  private crearFechaMensual(anio: number, mes: number, dia: number): string {
    const ultimoDia = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
    const diaReal = Math.min(dia, ultimoDia);
    return `${anio}-${String(mes).padStart(2, '0')}-${String(diaReal).padStart(2, '0')}`;
  }

  private diasEntre(desde: string, hasta: string): number {
    const [anio1, mes1, dia1] = desde.split('-').map(Number);
    const [anio2, mes2, dia2] = hasta.split('-').map(Number);
    const fecha1 = Date.UTC(anio1, mes1 - 1, dia1);
    const fecha2 = Date.UTC(anio2, mes2 - 1, dia2);
    return Math.round((fecha2 - fecha1) / 86400000);
  }

  private fechaSQL(fecha: string | Date): string {
    if (typeof fecha === 'string') {
      return fecha.slice(0, 10);
    }
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  
}
