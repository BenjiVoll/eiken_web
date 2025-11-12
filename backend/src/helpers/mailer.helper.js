import nodemailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } from '../config/configEnv.js';

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true para 465, false para otros puertos
  auth: {
    user: EMAIL_USER, // tu correo
    pass: EMAIL_PASS, // tu contraseña de aplicación
  },
});

/**
 * Envía un correo electrónico.
 * @param {string} to - El destinatario del correo.
 * @param {string} subject - El asunto del correo.
 * @param {string} html - El contenido HTML del correo.
 */
export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Eiken Design" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    // En un entorno de producción, podrías registrar este error de forma más robusta.
  }
};
