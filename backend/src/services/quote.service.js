"use strict";
import { AppDataSource } from "../config/configDb.js";
import { QuoteSchema } from "../entity/quote.entity.js";
import { ServiceSchema } from "../entity/service.entity.js";
import { QuoteStatusSchema } from "../entity/quoteStatus.entity.js";
import UserSchema from "../entity/user.entity.js";
import { sendEmail } from '../helpers/mailer.helper.js';

const quoteRepository = AppDataSource.getRepository(QuoteSchema);
const userRepository = AppDataSource.getRepository(UserSchema);
const quoteStatusRepository = AppDataSource.getRepository(QuoteStatusSchema);

export const createQuote = async (data) => {
  const { clientName, clientEmail, clientPhone, company, service, customServiceTitle, categoryId, description, urgency, quotedAmount, notes } = data;

  let serviceObj = null;
  if (service) {
    // Si viene un objeto, usar el id. Si viene un id, buscar el objeto.
    if (typeof service === 'object' && service.id) {
      serviceObj = await AppDataSource.getRepository(ServiceSchema).findOneBy({ id: service.id });
    } else if (typeof service === 'number' || typeof service === 'string') {
      serviceObj = await AppDataSource.getRepository(ServiceSchema).findOneBy({ id: service });
    }
  }

  // Obtener el estado inicial "Pendiente"
  const pendingStatus = await quoteStatusRepository.findOneBy({ name: "Pendiente" });
  if (!pendingStatus) {
    throw new Error("Estado 'Pendiente' no encontrado. Asegúrate de que los estados estén inicializados.");
  }

  const quote = quoteRepository.create({
    clientName,
    clientEmail,
    clientPhone,
    company,
    service: serviceObj || null,
    customServiceTitle: customServiceTitle || null,
    category: categoryId ? { id: categoryId } : null,
    description,
    urgency: urgency || "Bajo",
    quoteStatus: pendingStatus,
    quotedAmount,
    notes
  });

  await quoteRepository.save(quote);

  // --- INICIO: Notificación por correo a los administradores ---
  const adminsAndManagers = await userRepository.find({
    where: [
        { role: 'admin' },
        { role: 'manager' }
    ]
  });
  const adminEmails = adminsAndManagers.map(user => user.email);

  if (adminEmails.length > 0) {
    const subjectAdmin = `Nueva Cotización Recibida de ${quote.clientName}`;
    const htmlAdmin = `
      <h1>Nueva Solicitud de Cotización #${quote.id}</h1>
      <p>Has recibido una nueva solicitud de cotización a través del sitio web.</p>
      <h2>Detalles del Cliente:</h2>
      <ul>
        <li><strong>Nombre:</strong> ${quote.clientName}</li>
        <li><strong>Email:</strong> ${quote.clientEmail}</li>
        <li><strong>Teléfono:</strong> ${quote.clientPhone}</li>
        ${quote.company ? `<li><strong>Empresa:</strong> ${quote.company}</li>` : ''}
      </ul>
      <h2>Detalles de la Solicitud:</h2>
      <ul>
        <li><strong>Servicio/Título:</strong> ${data.customServiceTitle || (quote.service ? quote.service.name : 'No especificado')}</li>
        <li><strong>Urgencia:</strong> ${quote.urgency}</li>
      </ul>
      <p><strong>Descripción:</strong></p>
      <p>${quote.description}</p>
      <hr>
      <p>Puedes gestionar esta cotización en la intranet de Eiken Design.</p>
    `;
    
    // Enviar correo a todos los administradores y managers
    for (const email of adminEmails) {
        await sendEmail(email, subjectAdmin, htmlAdmin);
    }
  }
  // --- FIN: Notificación por correo ---

  return quote;
};

export const updateQuote = async (id, data) => {
  const quote = await quoteRepository.findOne({
    where: { id },
    relations: ["quoteStatus"]
  });
  if (!quote) {
    throw new Error("Cotización no encontrada");
  }

  const oldStatusName = quote.quoteStatus?.name;

  // Si se está actualizando el estado
  if (data.statusId) {
    const newStatus = await quoteStatusRepository.findOneBy({ id: data.statusId });
    if (!newStatus) {
      throw new Error("Estado de cotización no encontrado");
    }
    quote.quoteStatus = newStatus;
    delete data.statusId;
  }

  Object.assign(quote, data);
  await quoteRepository.save(quote);

  // Recargar para tener las relaciones actualizadas
  const updatedQuote = await quoteRepository.findOne({
    where: { id },
    relations: ["quoteStatus", "service", "category"]
  });

  // --- INICIO: Notificación de propuesta al cliente ---
  // Se envía si el estado cambia a "Cotizado" y se ha añadido un monto.
  if (updatedQuote.quoteStatus?.name === 'Cotizado' && oldStatusName !== 'Cotizado' && updatedQuote.quotedAmount) {
    const subjectClient = `Tu Propuesta de Eiken Design está Lista (Cotización #${updatedQuote.id})`;
    const htmlClient = `
      <h1>Hola ${updatedQuote.clientName},</h1>
      <p>Gracias por tu interés en Eiken Design. Hemos preparado una propuesta para tu solicitud.</p>
      <h2>Detalles de la Propuesta:</h2>
      <p><strong>Monto Propuesto:</strong> CLP $${parseFloat(updatedQuote.quotedAmount).toLocaleString('es-CL')}</p>
      ${updatedQuote.notes ? `<p><strong>Notas Adicionales:</strong><br>${updatedQuote.notes}</p>` : ''}
      <hr>
      <p>Si estás de acuerdo con la propuesta, por favor, <strong>responde a este correo electrónico para confirmar</strong> y procederemos con los siguientes pasos.</p>
      <p>Si tienes alguna duda, no dudes en contactarnos.</p>
      <br>
      <p>Saludos cordiales,</p>
      <p><strong>El equipo de Eiken Design</strong></p>
    `;
    await sendEmail(updatedQuote.clientEmail, subjectClient, htmlClient);
  }
  // --- FIN: Notificación ---

  return updatedQuote;
};

export const getQuotes = async () => {
  const quotes = await quoteRepository.find({
    relations: ["service", "category", "quoteStatus"],
    order: { createdAt: "DESC" }
  });
  return quotes;
};

export const getQuoteById = async (id) => {
  const quote = await quoteRepository.findOne({
    where: { id },
    relations: ["service", "category", "quoteStatus"]
  });
  return quote;
};

export const getQuotesByStatus = async (statusName) => {
  const status = await quoteStatusRepository.findOneBy({ name: statusName });
  if (!status) {
    throw new Error("Estado de cotización no encontrado");
  }

  const quotes = await quoteRepository.find({
    where: { quoteStatus: { id: status.id } },
    relations: ["service", "category", "quoteStatus"],
    order: { createdAt: "DESC" }
  });
  return quotes;
};

export const getQuotesByUrgency = async (urgency) => {
  const validUrgencies = ["Baja", "Media", "Alta", "Urgente"];
  if (!validUrgencies.includes(urgency)) {
    throw new Error("Nivel de urgencia no válido");
  }

  const quotes = await quoteRepository.find({
    where: { urgency },
    relations: ["service", "category"],
    order: { createdAt: "DESC" }
  });
  return quotes;
};

export const updateQuoteStatus = async (id, newStatus) => {
  const validStatuses = ["Pendiente", "En Revisión", "Cotizado", "Aprobado", "Rechazado"];

  // Si newStatus es un objeto, extraer el nombre del estado
  const statusName = typeof newStatus === 'object' && newStatus.name ? newStatus.name : newStatus;

  console.log(`Estado recibido: ${JSON.stringify(newStatus)}`); // Registro para depuración
  console.log(`Estado procesado: ${statusName}`); // Registro para depuración

  if (!validStatuses.includes(statusName)) {
    console.error(`Estado inválido: ${statusName}`); // Registro para depuración
    throw new Error("Estado de cotización no válido");
  }

  const quote = await quoteRepository.findOne({
    where: { id },
    relations: ["service"]
  });

  if (!quote) {
    console.error(`Cotización no encontrada para ID: ${id}`); // Registro para depuración
    throw new Error("Cotización no encontrada");
  }

  const oldStatus = quote.status;
  quote.status = statusName;
  await quoteRepository.save(quote);

  console.log(`Estado actualizado de ${oldStatus} a ${statusName} para la cotización ID: ${id}`); // Registro para depuración

  // --- INICIO: Notificación de cambio de estado ---
  if (statusName === 'Aprobado' && oldStatus !== 'Aprobado') {
    const adminsAndManagers = await userRepository.find({
      where: [
          { role: 'admin' },
          { role: 'manager' }
      ]
    });
    const adminEmails = adminsAndManagers.map(user => user.email);

    if (adminEmails.length > 0) {
      const subjectAdmin = `¡Cotización #${quote.id} Aprobada por el Cliente!`;
      const htmlAdmin = `
        <h1>¡Buenas noticias!</h1>
        <p>El cliente <strong>${quote.clientName}</strong> ha aprobado la cotización #${quote.id}.</p>
        <p><strong>Servicio:</strong> ${quote.customServiceTitle || (quote.service ? quote.service.name : 'No especificado')}</p>
        <p><strong>Monto Aprobado:</strong> CLP $${parseFloat(quote.quotedAmount).toLocaleString('es-CL')}</p>
        <p>Ya puedes convertir esta cotización en un proyecto desde la intranet.</p>
      `;
      
      for (const email of adminEmails) {
        await sendEmail(email, subjectAdmin, htmlAdmin);
      }
    }
  }
  // --- FIN: Notificación ---

  return quote;
};

export const deleteQuote = async (id) => {
  const quote = await quoteRepository.findOneBy({ id });
  if (!quote) {
    throw new Error("Cotización no encontrada");
  }

  await quoteRepository.remove(quote);
  return { mensaje: "Cotización eliminada exitosamente" };
};
