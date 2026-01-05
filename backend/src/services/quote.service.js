"use strict";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { AppDataSource } from "../config/configDb.js";
import { QuoteSchema } from "../entity/quote.entity.js";
import { ClientSchema } from "../entity/user.entity.client.js";
import { ServiceSchema } from "../entity/service.entity.js";
import { ProjectSchema } from "../entity/project.entity.js";
import { mailService } from "./mail.service.js";

const quoteRepository = AppDataSource.getRepository(QuoteSchema);

async function findOrCreateClient(clientData) {
  const clientRepository = AppDataSource.getRepository(ClientSchema);

  let client = await clientRepository.findOne({
    where: { email: clientData.clientEmail }
  });

  if (client) {
    let updated = false;
    if (clientData.clientName && !client.name) {
      client.name = clientData.clientName;
      updated = true;
    }
    if (clientData.clientPhone && !client.phone) {
      client.phone = clientData.clientPhone;
      updated = true;
    }
    if (clientData.company && !client.company) {
      client.company = clientData.company;
      updated = true;
    }

    if (updated) {
      await clientRepository.save(client);
    }
    return client;
  }

  const newClient = clientRepository.create({
    email: clientData.clientEmail,
    name: clientData.clientName,
    phone: clientData.clientPhone || null,
    company: clientData.company || null,
    rut: null,
    address: null,
    clientType: clientData.company ? "company" : "individual",
    source: "quote",
    isActive: true,
  });

  return await clientRepository.save(newClient);
}

export const createQuote = async (data) => {
  const { clientName, clientEmail, clientPhone, company, service, customServiceTitle, categoryId, description, requestedDeliveryDate, quotedAmount, notes } = data;

  const client = await findOrCreateClient({
    clientName,
    clientEmail,
    clientPhone,
    company
  });

  let serviceObj = null;
  if (service) {
    if (typeof service === 'object' && service.id) {
      serviceObj = await AppDataSource.getRepository(ServiceSchema).findOneBy({ id: service.id });
    } else if (typeof service === 'number' || typeof service === 'string') {
      serviceObj = await AppDataSource.getRepository(ServiceSchema).findOneBy({ id: service });
    }
  }

  const quote = quoteRepository.create({
    clientId: client.id,
    service: serviceObj || null,
    customServiceTitle: customServiceTitle || null,
    category: categoryId ? { id: categoryId } : null,
    description,
    requestedDeliveryDate: requestedDeliveryDate || null,
    status: "Pendiente",
    quotedAmount,
    notes
  });

  await quoteRepository.save(quote);

  mailService.sendQuoteNotification({ ...quote, client });
  mailService.sendNewQuoteAlert({ ...quote, client });

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
    relations: ["client", "service", "category"],
    order: { createdAt: "DESC" }
  });
  return quotes;
};

export const getQuoteById = async (id) => {
  const quote = await quoteRepository.findOne({
    where: { id },
    relations: ["client", "service", "category"]
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
    relations: ["client", "service", "category"],
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
    relations: ["client", "service", "category"]
  });

  if (!quote) {
    throw new Error("Cotización no encontrada");
  }

  const token = crypto.randomBytes(32).toString('hex');
  quote.acceptanceToken = token;
  quote.quotedAmount = amount;
  quote.status = "Cotizado";
  quote.notes = quote.notes ? `${quote.notes}\n\n[Propuesta]: ${message}` : `[Propuesta]: ${message}`;

  await quoteRepository.save(quote);

  mailService.sendQuoteProposal(quote, message);

  return quote;
};

export const acceptQuoteByToken = async (token) => {
  const quote = await quoteRepository.findOne({
    where: { acceptanceToken: token },
    relations: ["client", "service"]
  });

  if (!quote) throw new Error("Token de cotización inválido o expirado");

  // Si ya estaba aprobado, avisar pero no error
  if (quote.status === "Aprobado" || quote.status === "Convertido") {
    return { success: true, message: "La cotización ya fue aprobada anteriormente", quote };
  }

  quote.status = "Aprobado";
  quote.acceptanceToken = null;
  await quoteRepository.save(quote);

  mailService.sendQuoteAcceptedAlert(quote);

  return { success: true, message: "Cotización aprobada correctamente", quote };
};

export const convertQuoteToProject = async (id) => {
  const quote = await quoteRepository.findOne({
    where: { id },
    relations: ["client", "service", "category", "service.division", "service.category"]
  });

  if (!quote) {
    throw new Error("Cotización no encontrada");
  }

  const projectRepository = AppDataSource.getRepository(ProjectSchema);

  const newProject = projectRepository.create({
    title: quote.customServiceTitle || quote.service?.name || "Proyecto sin título",
    description: quote.description,
    clientId: quote.clientId,
    category: quote.category ? quote.category.id : (quote.service?.category ? quote.service.category.id : 1),
    division: quote.service?.division ? quote.service.division.id : 1,
    status: "En Proceso",
    priority: "Medio",
    budgetAmount: quote.quotedAmount || 0,
    notes: quote.notes,
    quoteId: quote.id,
    isFeatured: false,
    image: (quote.referenceImages && quote.referenceImages.length > 0) ? quote.referenceImages[0] : null
  });

  await projectRepository.save(newProject);

  quote.status = "Convertido";
  await quoteRepository.save(quote);

  return newProject;
};


export const deleteQuote = async (id) => {
  const quote = await quoteRepository.findOneBy({ id });
  if (!quote) {
    throw new Error("Cotización no encontrada");
  }

  await quoteRepository.remove(quote);
  return { mensaje: "Cotización eliminada exitosamente" };
};

// --- Funciones de imágenes ---
export const uploadQuoteImages = async (id, files) => {
  if (!files || files.length === 0) {
    throw new Error("No se subieron archivos");
  }

  if (files.length > 3) {
    throw new Error("Máximo 3 imágenes permitidas");
  }

  const quote = await quoteRepository.findOneBy({ id });
  if (!quote) {
    throw new Error("Cotización no encontrada");
  }

  const currentImages = quote.referenceImages || [];

  if (currentImages.length + files.length > 3) {
    files.forEach(file => {
      const filePath = path.join(process.cwd(), "uploads", file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    throw new Error(`Solo puedes tener 3 imágenes. Ya tienes ${currentImages.length}`);
  }

  const newImages = files.map(file => file.filename);
  quote.referenceImages = [...currentImages, ...newImages];

  await quoteRepository.save(quote);

  return { images: quote.referenceImages, quote };
};

export const deleteQuoteImage = async (id, filename) => {
  const quote = await quoteRepository.findOneBy({ id });
  if (!quote) throw new Error("Cotización no encontrada");

  if (!quote.referenceImages || quote.referenceImages.length === 0) {
    return { mensaje: "La cotización no tiene imágenes" };
  }

  const updatedImages = quote.referenceImages.filter(img => img !== filename);

  if (updatedImages.length === quote.referenceImages.length) {
    throw new Error("Imagen no encontrada");
  }

  const imagePath = path.join(process.cwd(), "uploads", filename);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  quote.referenceImages = updatedImages.length > 0 ? updatedImages : null;
  await quoteRepository.save(quote);

  return { mensaje: "Imagen eliminada correctamente" };
};