"use strict";
import { AppDataSource } from "../config/configDb.js";
import { QuoteSchema } from "../entity/quote.entity.js";
import { ClientSchema } from "../entity/user.entity.client.js";
import { ServiceSchema } from "../entity/service.entity.js";
import { mailService } from "./mail.service.js";

const quoteRepository = AppDataSource.getRepository(QuoteSchema);

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
    status: "Pendiente",
    quotedAmount,
    notes
  });

  await quoteRepository.save(quote);

  // Send email notifications asynchronously
  mailService.sendQuoteNotification(quote);
  mailService.sendNewQuoteAlert(quote);

  return quote;
};

export const updateQuote = async (id, data) => {
  const quote = await quoteRepository.findOneBy({ id });
  if (!quote) {
    throw new Error("Cotización no encontrada");
  }

  Object.assign(quote, data);
  await quoteRepository.save(quote);
  return quote;
};

export const getQuotes = async () => {
  const quotes = await quoteRepository.find({
    relations: ["service", "category"],
    order: { createdAt: "DESC" }
  });
  return quotes;
};

export const getQuoteById = async (id) => {
  const quote = await quoteRepository.findOne({
    where: { id },
    relations: ["service", "category"]
  });
  return quote;
};

export const getQuotesByStatus = async (status) => {
  const validStatuses = ["Pendiente", "Revisando", "Cotizado", "Aprobado", "Rechazado"];
  if (!validStatuses.includes(status)) {
    throw new Error("Estado de cotización no válido");
  }

  const quotes = await quoteRepository.find({
    where: { status },
    relations: ["service", "category"],
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
  const validStatuses = ["Pendiente", "Revisando", "Cotizado", "Aprobado", "Rechazado"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Estado de cotización no válido");
  }

  const quote = await quoteRepository.findOneBy({ id });
  if (!quote) {
    throw new Error("Cotización no encontrada");
  }

  quote.status = newStatus;
  await quoteRepository.save(quote);
  return quote;
};

export const replyToQuote = async (id, amount, message) => {
  const quote = await quoteRepository.findOne({
    where: { id },
    relations: ["service", "category"]
  });

  if (!quote) {
    throw new Error("Cotización no encontrada");
  }

  quote.quotedAmount = amount;
  quote.status = "Cotizado";
  // Optionally append the proposal message to notes or handle it differently.
  // For now, we'll append it to notes for record keeping.
  quote.notes = quote.notes ? `${quote.notes}\n\n[Propuesta]: ${message}` : `[Propuesta]: ${message}`;

  await quoteRepository.save(quote);

  // Send email
  mailService.sendQuoteProposal(quote, message);

  return quote;
};

export const convertQuoteToProject = async (id) => {
  const quote = await quoteRepository.findOne({
    where: { id },
    relations: ["service", "category"]
  });

  if (!quote) {
    throw new Error("Cotización no encontrada");
  }

  if (quote.status !== "Aprobado") {
    throw new Error("Solo se pueden convertir cotizaciones aprobadas");
  }

  // Verificar si ya fue convertida (aunque el estado debería prevenirlo, es doble check)
  const existingProject = await AppDataSource.getRepository("Project").findOneBy({ quoteId: id });
  if (existingProject) {
    throw new Error("Esta cotización ya ha sido convertida a proyecto");
  }

  // Crear el proyecto
  // Nota: RF_03 dice "crea automáticamente un nuevo proyecto con estado 'Completado'".
  // Esto es inusual, pero seguiremos el requerimiento.
  // Asumiremos que el cliente existe. Si no, habría que crearlo o manejarlo.
  // La cotización tiene clientName, email, phone.
  // Buscamos cliente por email, si no existe, ¿lo creamos?
  // RF_08 dice que usuarios se registran.
  // Asumiremos que el cliente YA existe como usuario tipo 'client' o similar, o buscamos por email en tabla users/clients.
  // En quote.entity.js no hay relación directa a User, solo campos de texto.
  // En project.entity.js se requiere clientId.
  // Vamos a buscar un cliente con ese email. Si no existe, fallamos o lo creamos?
  // El requerimiento no especifica creación de usuario cliente.
  // Asumiremos que se busca en la tabla de clientes (User con rol client o tabla Client si existe separada).
  // En user.entity.client.js existe ClientSchema.

  const clientRepository = AppDataSource.getRepository(ClientSchema);
  let client = await clientRepository.findOneBy({ email: quote.clientEmail });

  if (!client) {
    // Si no existe cliente, lo creamos?
    // Para simplificar y cumplir el flujo, crearemos un cliente básico.
    client = clientRepository.create({
      name: quote.clientName,
      email: quote.clientEmail,
      phone: quote.clientPhone,
      company: quote.company
    });
    await clientRepository.save(client);
  }

  const projectRepository = AppDataSource.getRepository("Project");
  const project = projectRepository.create({
    title: quote.customServiceTitle || (quote.service ? quote.service.name : "Proyecto desde Cotización"),
    description: quote.description,
    clientId: client.id,
    projectType: quote.category ? quote.category.id : 1, // Default category if null?
    division: quote.service ? quote.service.division : 1, // Default division?
    status: "Completado", // Según RF_03
    priority: quote.urgency === "Urgente" ? "Urgente" : "Medio",
    budgetAmount: quote.quotedAmount,
    notes: quote.notes,
    quoteId: quote.id
  });

  await projectRepository.save(project);

  // Actualizar estado de cotización
  quote.status = "Convertido";
  await quoteRepository.save(quote);

  return project;
};

export const deleteQuote = async (id) => {
  const quote = await quoteRepository.findOneBy({ id });
  if (!quote) {
    throw new Error("Cotización no encontrada");
  }

  await quoteRepository.remove(quote);
  return { mensaje: "Cotización eliminada exitosamente" };
};
