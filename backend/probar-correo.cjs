
require('dotenv').config();
const nodemailer = require('nodemailer');

async function probarCorreo() {
  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD } = process.env;
  console.log({
    host: MAIL_HOST,
    port: MAIL_PORT,
    usuarioCargado: Boolean(MAIL_USER),
    longitudUsuario: MAIL_USER?.length,
    contraseñaCargada: Boolean(MAIL_PASSWORD),
    longitudContraseña: MAIL_PASSWORD?.length,
    tieneEspacios: /\s/.test(MAIL_PASSWORD || ''),
  });
  if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASSWORD) {
    throw new Error(
      'Faltan variables de correo en el archivo .env',
    );
  }

  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
  });

  await transporter.verify();
  console.log('Conexión con Gmail establecida correctamente.');

  const resultado = await transporter.sendMail({
    from: `"TramiteSV" <${MAIL_USER}>`,
    to: MAIL_USER,
    subject: 'Prueba de correo - TrámiteSV',
    text: '¡Excelente! TrámiteSV puede enviar correos electrónicos.',
  });

  console.log('Correo de prueba enviado:', resultado.messageId);
  console.log('Revisa tu bandeja de entrada y la carpeta Spam.');
}

probarCorreo().catch((error) => {
  console.error('No se pudo completar la prueba:', error.message);
  process.exitCode = 1;
});
