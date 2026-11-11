
import 'dotenv/config';
import nodemailer from 'nodemailer';

async function probarCorreoDUI() {
  const correo = process.env.MAIL_USER;
  const password = process.env.MAIL_PASSWORD;

  if (!correo || !password) {
    throw new Error(
      'No se encontraron MAIL_USER o MAIL_PASSWORD. Revisa el archivo .env.',
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: correo,
      pass: password,
    },
  });

  const destinatario = 'Brissveycalderon23@gmail.com';
  const fecha = '30/10/2026';
  const diasRestantes = 7;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:30px 12px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:#123b32;padding:28px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;">TrámiteSV</h1>
                    <p style="margin:8px 0 0;color:#d1fae5;font-size:12px;letter-spacing:1px;">
                      RECORDATORIO DE VENCIMIENTO
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px;">
                    <h2 style="color:#123b32;margin-top:0;">
                      Tu DUI está próximo a vencer
                    </h2>
                    <p style="font-size:15px;line-height:1.7;">
                      Hola, Brissvey. Queremos ayudarte a mantener tus documentos al día.
                    </p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
                      <tr>
                        <td style="padding:20px;">
                          <p style="margin:0 0 6px;color:#64748b;font-size:12px;">DOCUMENTO</p>
                          <p style="margin:0 0 18px;color:#123b32;font-size:18px;font-weight:bold;">
                            Documento Único de Identidad (DUI)
                          </p>
                          <p style="margin:0 0 6px;color:#64748b;font-size:12px;">FECHA DE VENCIMIENTO</p>
                          <p style="margin:0 0 18px;font-size:16px;font-weight:bold;">${fecha}</p>
                          <p style="margin:0 0 6px;color:#64748b;font-size:12px;">DÍAS RESTANTES</p>
                          <p style="margin:0;color:#166534;font-size:24px;font-weight:bold;">
                            ${diasRestantes} días
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size:14px;line-height:1.7;margin-top:24px;">
                      Consulta la información oficial para conocer los pasos que debes seguir.
                    </p>

                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px auto;">
                      <tr>
                        <td style="background:#166534;border-radius:6px;">
                          <a href="https://dui.gob.sv/" target="_blank"
                             style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-weight:bold;">
                            Consultar portal oficial del DUI
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size:12px;line-height:1.6;color:#64748b;">
                      Verifica los requisitos y las condiciones directamente con la institución oficial.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px;text-align:center;">
                    <p style="margin:0;color:#475569;font-weight:bold;">TrámiteSV</p>
                    <p style="margin:7px 0 0;color:#64748b;font-size:11px;">
                      Mensaje automático de prueba. No respondas a este correo.
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

  try {
    const resultado = await transporter.sendMail({
      from: process.env.MAIL_FROM || correo,
      to: destinatario,
      subject: 'TrámiteSV | Prueba del correo de vencimiento del DUI',
      text: [
        'Hola, Brissvey.',
        'Tu DUI está próximo a vencer.',
        `Fecha de vencimiento: ${fecha}`,
        `Días restantes: ${diasRestantes}`,
        'Portal oficial: https://dui.gob.sv/',
        'Mensaje automático de prueba de TrámiteSV.',
      ].join('\n'),
      html,
    });

    console.log('Correo de prueba enviado correctamente.');
    console.log('Destinatario:', destinatario);
    console.log('Identificador:', resultado.messageId);
  } finally {
    transporter.close();
  }
}

probarCorreoDUI().catch((error: unknown) => {
  console.error(
    'No se pudo enviar el correo de prueba:',
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
