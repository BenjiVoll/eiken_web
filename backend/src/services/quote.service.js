"use strict";
import { AppDataSource } from "../config/configDb.js";
import { QuoteSchema } from "../entity/quote.entity.js";
import { ClientSchema } from "../entity/user.entity.cliente.js";

const quoteRepository = AppDataSource.getRepository(QuoteSchema);
const clientRepository = AppDataSource.getRepository(ClientSchema);

export const createQuote = async (data) => {
  const { clientId, clientName, clientEmail, clientPhone, company, serviceType, description, urgency, estimatedAmount, notes } = data;
  
  // Si se proporciona clientId, verificar que el cliente existe
  if (clientId) {
    const client = await clientRepository.findOneBy({ id: clientId });
    if (!client) {
      throw new Error("Cliente no encontrado");
    }
  }

  const quote = quoteRepository.create({
    clientId,
    clientName,
    clientEmail,
    clientPhone,
    company,
    serviceType,
    description,
    urgency: urgency || "medium",
    status: "pending",
    estimatedAmount,
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

  // Si se está cambiando el cliente, verificar que existe
  if (data.clientId && data.clientId !== quote.clientId) {
    const client = await clientRepository.findOneBy({ id: data.clientId });
    if (!client) {
      throw new Error("Cliente no encontrado");
    }
  }

  Object.assign(quote, data);
  await quoteRepository.save(quote);
  return quote;
};

export const getQuotes = async () => {
  const quotes = await quoteRepository.find({
    relations: ["client"],
    order: { createdAt: "DESC" }
  });
  return quotes;
};

export const getQuoteById = async (id) => {
  const quote = await quoteRepository.findOne({
    where: { id },
    relations: ["client"]
  });
  return quote;
};

export const getQuotesByStatus = async (status) => {
  const validStatuses = ["pending", "approved", "rejected", "in_process", "completed"];
  if (!validStatuses.includes(status)) {
    throw new Error("Estado de cotización no válido");
  }

  const quotes = await quoteRepository.find({
    where: { status },
    relations: ["client"],
    order: { createdAt: "DESC" }
  });
  return quotes;
};

export const getQuotesByUrgency = async (urgency) => {
  const validUrgencies = ["low", "medium", "high", "urgent"];
  if (!validUrgencies.includes(urgency)) {
    throw new Error("Nivel de urgencia no válido");
  }

  const quotes = await quoteRepository.find({
    where: { urgency },
    relations: ["client"],
    order: { createdAt: "DESC" }
  });
  return quotes;
};

export const getQuotesByClient = async (clientId) => {
  const quotes = await quoteRepository.find({
    where: { clientId },
    relations: ["client"],
    order: { createdAt: "DESC" }
  });
  return quotes;
};

export const updateQuoteStatus = async (id, newStatus) => {
  const validStatuses = ["pending", "approved", "rejected", "in_process", "completed"];
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
