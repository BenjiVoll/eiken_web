"use strict";
import fs from "fs";
import path from "path";
import { AppDataSource } from "../config/configDb.js";
import { QuoteSchema } from "../entity/quote.entity.js";
import { ClientSchema } from "../entity/user.entity.client.js";
import { ServiceSchema } from "../entity/service.entity.js";
import { mailService } from "./mail.service.js";

const quoteRepository = AppDataSource.getRepository(QuoteSchema);

export const createQuote = async (data) => {
  const { clientName, clientEmail, clientPhone, company, service, customServiceTitle, categoryId, description, requestedDeliveryDate, quotedAmount, notes } = data;

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
    requestedDeliveryDate: requestedDeliveryDate || null,
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


  const existingProject = await AppDataSource.getRepository("Project").findOneBy({ quoteId: id });
  if (existingProject) {
    throw new Error("Esta cotización ya ha sido convertida a proyecto");
  }

  // Buscar o crear cliente
  const clientRepository = AppDataSource.getRepository(ClientSchema);
  let client = await clientRepository.findOneBy({ email: quote.clientEmail });

  if (!client) {
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
    projectType: quote.category ? quote.category.id : 1,
    division: quote.service ? quote.service.division : 1,
    status: "Completado",
    priority: "Medio",
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