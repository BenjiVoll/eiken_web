"use strict";
import { AppDataSource } from "../config/configDb.js";
import { QuoteSchema } from "../entity/quote.entity.js";
import { ClientSchema } from "../entity/user.entity.client.js";
import { ServiceSchema } from "../entity/service.entity.js";

const quoteRepository = AppDataSource.getRepository(QuoteSchema);
const clientRepository = AppDataSource.getRepository(ClientSchema);

export const createQuote = async (data) => {
  const { clientName, clientEmail, clientPhone, company, serviceId, customServiceTitle, serviceType, description, urgency, quotedAmount, notes } = data;
  
  const quote = quoteRepository.create({
    clientName,
    clientEmail,
    clientPhone,
    company,
    serviceId: serviceId || null,
    customServiceTitle: customServiceTitle || null,
    serviceType,
    description,
    urgency: urgency || "medium",
    status: "pending",
    quotedAmount,
    notes
  });

  await quoteRepository.save(quote);
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
    relations: ["service"],
    order: { createdAt: "DESC" }
  });
  return quotes;
};

export const getQuoteById = async (id) => {
  const quote = await quoteRepository.findOne({
    where: { id },
    relations: ["service"]
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
    relations: ["service"],
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
    relations: ["service"],
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

export const deleteQuote = async (id) => {
  const quote = await quoteRepository.findOneBy({ id });
  if (!quote) {
    throw new Error("Cotización no encontrada");
  }

  await quoteRepository.remove(quote);
  return { mensaje: "Cotización eliminada exitosamente" };
};
