import nodemailer from 'nodemailer';

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
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
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
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
      console.log('Client notification sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email to client:', error);
    }
  }

  async sendNewQuoteAlert(quote) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@eiken.com';
      const mailOptions = {
        from: process.env.SMTP_FROM || '"Eiken Design" <no-reply@eiken.com>',
        to: adminEmail,
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
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/intranet/quotes" 
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
      console.log('Admin alert sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email to admin:', error);
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

              <p>Si estás de acuerdo con esta propuesta, por favor responde a este correo o contáctanos para proceder.</p>
            </div>
            <div style="background-color: #edf2f7; padding: 15px; text-align: center; font-size: 0.8em; color: #718096;">
              &copy; ${new Date().getFullYear()} Eiken Design. Todos los derechos reservados.
            </div>
          </div>
        `),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Proposal sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending proposal email:', error);
    }
  }

  async sendLowStockAlert(lowStockItems) {
    try {
      if (!lowStockItems || lowStockItems.length === 0) {
        return { success: false, message: 'No hay items con stock bajo' };
      }

      const adminEmail = process.env.ADMIN_EMAIL || 'admin@eiken.com';

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
        to: adminEmail,
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
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/intranet/inventory" 
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
}

export const mailService = new MailService();
