import nodemailer from 'nodemailer';
import { AppDataSource } from "../config/configDb.js";
import UserSchema from "../entity/user.entity.js";

const userRepository = AppDataSource.getRepository(UserSchema);

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      pool: true,
      maxConnections: 1,
      rateDelta: 10000,
      rateLimit: 3,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  getFrontendUrl() {
    const url = process.env.FRONTEND_URL || 'http://localhost:5173';
    return url.replace(/\/$/, '');
  }

  async getAdminEmails() {
    try {
      const admins = await userRepository.find({ where: { role: 'admin' } });
      const adminEmails = admins.map(admin => admin.email).filter(email => email);

      if (adminEmails.length === 0) {
        console.warn('⚠️ ADVERTENCIA: No hay administrador registrado para recibir notificaciones.');
        return [];
      }

      return adminEmails;
    } catch (error) {
      console.error('Error obteniendo emails de administrador:', error);
      return [];
    }
  }

  async sendQuoteNotification(quote) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || '"Eiken Design" <no-reply@eiken.com>',
        to: quote.client?.email,
        subject: `✅ Solicitud Recibida - Cotización #${quote.id || 'Nueva'}`,
        html: this.getHtmlTemplate('Confirmación de Cotización', `
          <!-- Header con colores Eiken Design -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6600 0%, #ff8533 100%); padding: 20px 40px; text-align: center;">
              <!-- Logo de Eiken Design (compacto) -->
              <img src="https://www.eikendesign.cl/fondo.jpg" 
                   alt="Eiken Design" 
                   style="max-width: 180px; max-height: 80px; width: auto; height: auto; display: block; margin: 0 auto;"
              />
            </td>
          </tr>
          
          <!-- Contenido principal -->
          <tr>
            <td style="padding: 50px 40px;">
              <!-- Icono de éxito con colores Eiken -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #FF6600 0%, #ff8533 100%); border-radius: 50%; line-height: 80px;">
                  <span style="color: white; font-size: 40px; font-weight: bold;">✓</span>
                </div>
              </div>

              <h2 style="color: #2b2b2b; font-size: 28px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                ¡Solicitud Recibida!
              </h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; text-align: center;">
                Hola <strong style="color: #FF6600;">${quote.client?.name}</strong>,<br>
                Hemos recibido tu solicitud de cotización. Nuestro equipo la revisará y te contactará pronto.
              </p>

              <!-- Card con detalles -->
              <div style="background: #f7f7f7; border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #FF6600;">
                <h3 style="color: #2b2b2b; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">
                  <span style="background: #FF6600; width: 6px; height: 24px; display: inline-block; margin-right: 12px; border-radius: 3px;"></span>
                  Detalles de tu Solicitud
                </h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                      <span style="color: #718096; font-size: 14px; font-weight: 500;">Servicio</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                      <span style="color: #2b2b2b; font-size: 14px; font-weight: 600;">${quote.customServiceTitle || (quote.service ? quote.service.name : 'General')}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                      <span style="color: #718096; font-size: 14px; font-weight: 500;">Fecha deseada de entrega</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                      <span style="color: #2b2b2b; font-size: 14px; font-weight: 600;">
                        ${quote.requestedDeliveryDate ? new Date(quote.requestedDeliveryDate).toLocaleDateString('es-CL') : 'No especificada'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 12px 0;">
                      <span style="color: #718096; font-size: 14px; font-weight: 500; display: block; margin-bottom: 8px;">Descripción</span>
                      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0; padding: 12px; background-color: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                        ${quote.description}
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Información adicional con colores Eiken -->
              <div style="background-color: #fff5f0; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #ffd4b3;">
                <p style="color: #2b2b2b; font-size: 14px; line-height: 1.6; margin: 0;">
                  <strong style="color: #FF6600;">📞 ¿Tienes preguntas?</strong><br>
                  Puedes responder a este correo o contactarnos directamente. Estamos aquí para ayudarte.
                </p>
              </div>

              <!-- Botón CTA con colores Eiken -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.getFrontendUrl()}" 
                   style="display: inline-block; background: linear-gradient(135deg, #FF6600 0%, #ff8533 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 102, 0, 0.3);">
                  Visitar Nuestro Sitio
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2b2b2b; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0;">
                <strong style="color: #FF6600;">Eiken Design</strong> - Diseño Publicitario & Gráfica Vehicular
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Eiken Design. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        `),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Notificación enviada al cliente: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error enviando correo al cliente:', error);
    }
  }

  async sendNewQuoteAlert(quote) {
    try {
      const adminEmails = await this.getAdminEmails();
      if (!adminEmails || adminEmails.length === 0) return;

      const mailOptions = {
        from: process.env.SMTP_FROM || '"Eiken Design" <no-reply@eiken.com>',
        to: adminEmails,
        subject: `🔔 Nueva Cotización: ${quote.client?.name}`,
        html: this.getHtmlTemplate('Nueva Cotización Recibida', `
          <!-- Header con colores Eiken Design -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6600 0%, #ff8533 100%); padding: 40px; text-align: center;">
              <!-- Logo de Eiken Design (compacto) -->
              <img src="https://www.eikendesign.cl/fondo.jpg" 
                   alt="Eiken Design" 
                   style="max-width: 180px; max-height: 80px; width: auto; height: auto; display: block; margin: 0 auto;"
              />
            </td>
          </tr>
          
          <!-- Contenido principal -->
          <tr>
            <td style="padding: 50px 40px;">
              <!-- Icono de alerta con colores Eiken -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #FF6600 0%, #ff8533 100%); border-radius: 50%; line-height: 80px;">
                  <span style="color: white; font-size: 40px; font-weight: bold;">🔔</span>
                </div>
              </div>

              <h2 style="color: #2b2b2b; font-size: 28px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                ¡Nueva Solicitud de Cotización!
              </h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; text-align: center;">
                Se ha recibido una nueva solicitud de <strong style="color: #FF6600;">${quote.client?.name}</strong>
              </p>

              <!-- Card con información del cliente -->
              <div style="background: #f7f7f7; border-radius: 12px; padding: 30px; margin-bottom: 20px; border-left: 4px solid #FF6600;">
                <h3 style="color: #2b2b2b; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">
                  <span style="background: #FF6600; width: 6px; height: 24px; display: inline-block; margin-right: 12px; border-radius: 3px;"></span>
                  Información del Cliente
                </h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                      <span style="color: #718096; font-size: 14px; font-weight: 500;">Nombre</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                      <span style="color: #2b2b2b; font-size: 14px; font-weight: 600;">${quote.client?.name}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                      <span style="color: #718096; font-size: 14px; font-weight: 500;">Email</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                      <a href="mailto:${quote.client?.email}" style="color: #FF6600; font-size: 14px; font-weight: 600; text-decoration: none;">${quote.client?.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                      <span style="color: #718096; font-size: 14px; font-weight: 500;">Teléfono</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                      <span style="color: #2b2b2b; font-size: 14px; font-weight: 600;">${quote.client?.phone}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #718096; font-size: 14px; font-weight: 500;">Empresa</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right;">
                      <span style="color: #2b2b2b; font-size: 14px; font-weight: 600;">${quote.client?.company || 'N/A'}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Card con detalles del proyecto -->
              <div style="background: #f7f7f7; border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #FF6600;">
                <h3 style="color: #2b2b2b; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">
                  <span style="background: #FF6600; width: 6px; height: 24px; display: inline-block; margin-right: 12px; border-radius: 3px;"></span>
                  Detalles del Proyecto
                </h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                      <span style="color: #718096; font-size: 14px; font-weight: 500;">Servicio</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                      <span style="color: #2b2b2b; font-size: 14px; font-weight: 600;">${quote.customServiceTitle || (quote.service ? quote.service.name : 'General')}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                      <span style="color: #718096; font-size: 14px; font-weight: 500;">Fecha deseada de entrega</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                      <span style="color: #2b2b2b; font-size: 14px; font-weight: 600;">
                        ${quote.requestedDeliveryDate ? new Date(quote.requestedDeliveryDate).toLocaleDateString('es-CL') : 'No especificada'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 12px 0;">
                      <span style="color: #718096; font-size: 14px; font-weight: 500; display: block; margin-bottom: 8px;">Descripción</span>
                      <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0; padding: 12px; background-color: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                        ${quote.description}
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Botón CTA con colores Eiken -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.getFrontendUrl()}/intranet/quotes" 
                   style="display: inline-block; background: linear-gradient(135deg, #FF6600 0%, #ff8533 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 102, 0, 0.3);">
                  Ver en Intranet
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2b2b2b; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0;">
                <strong style="color: #FF6600;">Eiken Design</strong> - Diseño Publicitario & Gráfica Vehicular
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Eiken Design. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        `),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Alerta enviada al administrador: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error enviando correo al administrador:', error);
    }
  }

  async sendQuoteProposal(quote, proposalMessage) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || '"Eiken Design" <no-reply@eiken.com>',
        to: quote.client?.email,
        subject: `Propuesta de Cotización - Eiken Design`,
        html: this.getHtmlTemplate('Propuesta de Cotización', `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #1a202c; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">Eiken Design</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
              <h2 style="color: #2d3748;">Hola ${quote.client?.name},</h2>
              <p style="line-height: 1.6;">Hemos analizado tu solicitud y tenemos la siguiente propuesta para ti:</p>
              
              <div style="background-color: #f0fff4; padding: 20px; border-radius: 5px; border-left: 5px solid #48bb78; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2f855a;">Detalles de la Propuesta</h3>
                <p style="white-space: pre-wrap;">${proposalMessage}</p>
                
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #9ae6b4;">
                  <span style="font-size: 1.2em; font-weight: bold; color: #2f855a;">Monto Cotizado:</span>
                  <span style="font-size: 1.5em; font-weight: bold; color: #276749; display: block;">
                    ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(quote.quotedAmount)}
                  </span>
                </div>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.getFrontendUrl()}/quote/accept/${quote.acceptanceToken}" 
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); margin-right: 15px;">
                  ✓ Aceptar Presupuesto
                </a>
                <a href="${this.getFrontendUrl()}/quote/reject/${quote.acceptanceToken}" 
                   style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">
                  ✗ Rechazar
                </a>
                <p style="margin-top: 15px; font-size: 0.9em; color: #718096;">Al hacer clic, confirmarás tu decisión sobre este presupuesto.</p>
              </div>

              <p>Si tienes dudas sobre esta propuesta, por favor responde a este correo.</p>
            </div>
            <div style="background-color: #edf2f7; padding: 15px; text-align: center; font-size: 0.8em; color: #718096;">
              &copy; ${new Date().getFullYear()} Eiken Design. Todos los derechos reservados.
            </div>
          </div>
        `),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Propuesta enviada: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error enviando correo de propuesta:', error);
    }
  }

  async sendLowStockAlert(lowStockItems) {
    try {
      if (!lowStockItems || lowStockItems.length === 0) {
        return { success: false, message: 'No hay items con stock bajo' };
      }

      const adminEmails = await this.getAdminEmails();
      if (!adminEmails || adminEmails.length === 0) {
        return { success: false, message: 'No hay administradores para notificar' };
      }

      // Generar HTML de la tabla de items
      const itemsHTML = lowStockItems.map(item => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: 500;">${item.name}</td>
          <td style="padding: 12px;">${item.type}</td>
          <td style="padding: 12px;">${item.color || 'N/A'}</td>
          <td style="padding: 12px; color: #dc2626; font-weight: 600;">${item.quantity} ${item.unit}</td>
          <td style="padding: 12px; color: #059669;">${item.minStock} ${item.unit}</td>
        </tr>
      `).join('');

      const mailOptions = {
        from: process.env.SMTP_FROM || '"Eiken Design" <no-reply@eiken.com>',
        to: adminEmails,
        subject: `⚠️ Alerta de Stock Bajo - ${lowStockItems.length} Material(es) Crítico(s)`,
        html: this.getHtmlTemplate('Alerta de Stock Bajo', `
          <!-- Header con colores Eiken Design -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6600 0%, #ff8533 100%); padding: 40px; text-align: center;">
              <img src="https://www.eikendesign.cl/fondo.jpg" 
                   alt="Eiken Design" 
                   style="max-width: 180px; max-height: 80px; width: auto; height: auto; display: block; margin: 0 auto;"
              />
            </td>
          </tr>
          
          <!-- Contenido principal -->
          <tr>
            <td style="padding: 50px 40px;">
              <!-- Icono de alerta -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); border-radius: 50%; line-height: 80px;">
                  <span style="color: white; font-size: 40px; font-weight: bold;">⚠️</span>
                </div>
              </div>

              <h2 style="color: #2b2b2b; font-size: 28px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Alerta de Stock Bajo
              </h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; text-align: center;">
                Se han detectado <strong style="color: #dc2626;">${lowStockItems.length} material(es)</strong> con stock bajo o crítico.
              </p>

              <!-- Tabla de materiales -->
              <div style="background: #f7f7f7; border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #dc2626;">
                <h3 style="color: #2b2b2b; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">
                  <span style="background: #dc2626; width: 6px; height: 24px; display: inline-block; margin-right: 12px; border-radius: 3px;"></span>
                  Materiales que Requieren Atención
                </h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #e5e7eb;">
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Material</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Tipo</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Color</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Stock Actual</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Mínimo</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHTML}
                  </tbody>
                </table>
              </div>

              <!-- Mensaje de acción -->
              <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #fbbf24;">
                <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0;">
                  <strong>⚡ Acción requerida:</strong> Por favor, revisar los materiales listados y realizar pedidos de reabastecimiento para evitar interrupciones en la producción.
                </p>
              </div>

              <!-- Botón CTA -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.getFrontendUrl()}/intranet/inventory" 
                   style="display: inline-block; background: linear-gradient(135deg, #FF6600 0%, #ff8533 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 102, 0, 0.3);">
                  Ver Inventario Completo
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2b2b2b; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0;">
                <strong style="color: #FF6600;">Eiken Design</strong> - Sistema de Gestión
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Eiken Design. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        `),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Low stock alert sent: %s', info.messageId);
      return {
        success: true,
        message: 'Email enviado correctamente',
        itemCount: lowStockItems.length
      };
    } catch (error) {
      console.error('❌ Error sending low stock alert:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  getHtmlTemplate(title, content) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title}</title>
        <!--[if mso]>
        <style type="text/css">
          body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
        </style>
        <![endif]-->
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f6f8;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
                ${content}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  translateStatus(status) {
    const statusMap = {
      'pending': 'Pendiente',
      'processing': 'En Proceso',
      'completed': 'Completada',
      'cancelled': 'Cancelada',
      'refunded': 'Reembolsada'
    };
    return statusMap[status] || status;
  }

  /**
   * Envía notificación de orden completada
   * @param {Object} order - Orden con items y cliente
   */
  async sendOrderCompletedEmail(order) {
    try {
      const itemsHTML = order.items?.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || item.service?.name || 'Producto'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${Number(item.totalPrice || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
        </tr>
      `).join('') || '';

      const mailOptions = {
        from: process.env.SMTP_FROM || '"Eiken Design" <no-reply@eiken.com>',
        to: order.client?.email,
        subject: `✅ Pago Confirmado - Orden #${order.id}`,
        html: this.getHtmlTemplate('Pago Confirmado', `
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px 40px; text-align: center;">
              <img src="https://www.eikendesign.cl/fondo.jpg" 
                   alt="Eiken Design" 
                   style="max-width: 180px; max-height: 80px; width: auto; height: auto; display: block; margin: 0 auto;"
              />
            </td>
          </tr>
          
          <tr>
            <td style="padding: 50px 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; line-height: 80px;">
                  <span style="color: white; font-size: 40px; font-weight: bold;">✓</span>
                </div>
              </div>

              <h2 style="color: #2b2b2b; font-size: 28px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                ¡Pago Confirmado!
              </h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; text-align: center;">
                Hola <strong style="color: #10b981;">${order.client?.name}</strong>,<br>
                Tu pago ha sido procesado exitosamente. A continuación el resumen de tu orden:
              </p>

              <div style="background: #f7fafc; border-radius: 12px; padding: 24px; margin: 30px 0;">
                <h3 style="color: #2b2b2b; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                  Orden #${order.id}
                </h3>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                  ${itemsHTML}
                  <tr>
                    <td colspan="2" style="padding: 15px 10px 10px; text-align: right; font-size: 18px; font-weight: 700;">
                      Total:
                    </td>
                    <td style="padding: 15px 10px 10px; text-align: right; font-size: 18px; font-weight: 700; color: #10b981;">
                      ${Number(order.totalAmount || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                    </td>
                  </tr>
                </table>
              </div>

              <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 30px 0 0; text-align: center;">
                Te contactaremos pronto para coordinar la entrega.
              </p>
            </td>
          </tr>
        `)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email de orden completada enviado a ${order.client?.email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de orden completada:', error);
      return false;
    }
  }

  /**
   * Envía notificación de reembolso
   * @param {Object} order - Orden reembolsada
   */
  async sendOrderRefundedEmail(order) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || '"Eiken Design" <no-reply@eiken.com>',
        to: order.client?.email,
        subject: `💰 Reembolso Procesado - Orden #${order.id}`,
        html: this.getHtmlTemplate('Reembolso Procesado', `
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px 40px; text-align: center;">
              <img src="https://www.eikendesign.cl/fondo.jpg" 
                   alt="Eiken Design" 
                   style="max-width: 180px; max-height: 80px; width: auto; height: auto; display: block; margin: 0 auto;"
              />
            </td>
          </tr>
          
          <tr>
            <td style="padding: 50px 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 50%; line-height: 80px;">
                  <span style="color: white; font-size: 40px; font-weight: bold;">💰</span>
                </div>
              </div>

              <h2 style="color: #2b2b2b; font-size: 28px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Reembolso Procesado
              </h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; text-align: center;">
                Hola <strong style="color: #3b82f6;">${order.client?.name}</strong>,<br>
                Tuorden #${order.id} ha sido reembolsada.
              </p>

              <div style="background: #f7fafc; border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
                <p style="color: #2b2b2b; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">
                  Monto reembolsado
                </p>
                <p style="color: #3b82f6; font-size: 32px; font-weight: 700; margin: 0;">
                  ${order.totalAmount?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                </p>
              </div>

              <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 30px 0 0; text-align: center;">
                El reembolso se procesará en 3-5 días hábiles según tu medio de pago.
              </p>
            </td>
          </tr>
        `)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email de reembolso enviado a ${order.client?.email}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de reembolso:', error);
      return false;
    }
  }

  /**
   * Envía alerta de nueva orden al administrador
   * @param {Object} order - Orden creada
   */
  async sendNewOrderAlert(order) {
    try {
      const adminEmails = await this.getAdminEmails();
      if (!adminEmails || adminEmails.length === 0) return;

      const itemsHTML = order.items?.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || item.service?.name || 'Producto'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${Number(item.totalPrice || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</td>
        </tr>
      `).join('') || '';

      const mailOptions = {
        from: process.env.SMTP_FROM || '"Eiken Design" <no-reply@eiken.com>',
        to: adminEmails,
        subject: `🔔 Nueva Venta Web - Orden #${order.id}`,
        html: this.getHtmlTemplate('Nueva Venta Web', `
          <tr>
            <td style="background: linear-gradient(135deg, #FF6600 0%, #ff8533 100%); padding: 40px; text-align: center;">
              <img src="https://www.eikendesign.cl/fondo.jpg" 
                   alt="Eiken Design" 
                   style="max-width: 180px; max-height: 80px; width: auto; height: auto; display: block; margin: 0 auto;"
              />
            </td>
          </tr>
          
          <tr>
            <td style="padding: 50px 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #FF6600 0%, #ff8533 100%); border-radius: 50%; line-height: 80px;">
                  <span style="color: white; font-size: 40px; font-weight: bold;">💰</span>
                </div>
              </div>

              <h2 style="color: #2b2b2b; font-size: 28px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                ¡Nueva Venta Realizada!
              </h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; text-align: center;">
                El cliente <strong style="color: #FF6600;">${order.client?.name}</strong> ha completado una compra.<br>
                Estado: <strong>${this.translateStatus(order.status)}</strong>
              </p>

              <div style="background: #f7fafc; border-radius: 12px; padding: 24px; margin: 30px 0;">
                <h3 style="color: #2b2b2b; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                  Detalle Orden #${order.id}
                </h3>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                  ${itemsHTML}
                  <tr>
                    <td colspan="2" style="padding: 15px 10px 10px; text-align: right; font-size: 18px; font-weight: 700;">
                      Total:
                    </td>
                    <td style="padding: 15px 10px 10px; text-align: right; font-size: 18px; font-weight: 700; color: #10b981;">
                      ${Number(order.totalAmount || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.getFrontendUrl()}/intranet/orders" 
                   style="display: inline-block; background: linear-gradient(135deg, #FF6600 0%, #ff8533 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 102, 0, 0.3);">
                  Ver en Intranet
                </a>
              </div>
            </td>
          </tr>
        `)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Admin order alert sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Error sending admin order alert:', error);
    }
  }

  /**
   * Alerta al admin cuando un cliente acepta presupuesto
   */
  async sendQuoteAcceptedAlert(quote) {
    try {
      const adminEmails = await this.getAdminEmails();
      if (!adminEmails || adminEmails.length === 0) return;

      const mailOptions = {
        from: process.env.SMTP_FROM || '"Eiken Design" <no-reply@eiken.com>',
        to: adminEmails,
        subject: `✅ Presupuesto Aprobado - Cotización #${quote.id}`,
        html: this.getHtmlTemplate('Presupuesto Aprobado', `
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
              <img src="https://www.eikendesign.cl/fondo.jpg" alt="Eiken Design" style="max-width: 180px; max-height: 80px; width: auto; height: auto; display: block; margin: 0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 40px; text-align: center;">
              <h2 style="color: #2b2b2b;">¡Presupuesto Aprobado!</h2>
              <p style="font-size: 16px; color: #4a5568;">
                  El cliente <strong>${quote.client?.name}</strong> ha aceptado el presupuesto para la cotización #${quote.id}.
              </p>
              <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #48bb78;">
                  <span style="font-size: 24px; font-weight: bold; color: #2f855a;">
                      ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(quote.quotedAmount)}
                  </span>
              </div>
              <a href="${this.getFrontendUrl()}/intranet/quotes" style="background: #2b2b2b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Gestionar Cotización
              </a>
            </td>
          </tr>
        `)
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending quote accepted alert:', error);
    }
  }

  /**
   * Alerta al admin cuando un cliente rechaza presupuesto
   */
  async sendQuoteRejectedAlert(quote) {
    try {
      const adminEmails = await this.getAdminEmails();
      if (!adminEmails || adminEmails.length === 0) return;

      const mailOptions = {
        from: process.env.SMTP_FROM || '"Eiken Design" <no-reply@eiken.com>',
        to: adminEmails,
        subject: `❌ Presupuesto Rechazado - Cotización #${quote.id}`,
        html: this.getHtmlTemplate('Presupuesto Rechazado', `
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; text-align: center;">
              <img src="https://www.eikendesign.cl/fondo.jpg" alt="Eiken Design" style="max-width: 180px; max-height: 80px; width: auto; height: auto; display: block; margin: 0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 40px; text-align: center;">
              <h2 style="color: #2b2b2b;">Presupuesto Rechazado</h2>
              <p style="font-size: 16px; color: #4a5568;">
                  El cliente <strong>${quote.client?.name}</strong> ha rechazado el presupuesto para la cotización #${quote.id}.
              </p>
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fca5a5;">
                  <span style="font-size: 24px; font-weight: bold; color: #dc2626;">
                      ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(quote.quotedAmount)}
                  </span>
              </div>
              <p style="color: #718096; font-size: 14px;">Puedes contactar al cliente para negociar o ajustar la propuesta.</p>
              <a href="${this.getFrontendUrl()}/intranet/quotes" style="background: #2b2b2b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Ver Cotización
              </a>
            </td>
          </tr>
        `)
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error enviando alerta de cotización rechazada:', error);
    }
  }
}

export const mailService = new MailService();
