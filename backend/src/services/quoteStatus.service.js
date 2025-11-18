"use strict";
import { AppDataSource } from "../config/configDb.js";
import { QuoteStatusSchema } from "../entity/quoteStatus.entity.js";

const quoteStatusRepository = AppDataSource.getRepository(QuoteStatusSchema);

export const getQuoteStatuses = async () => {
  return await quoteStatusRepository.find({
    order: { id: "ASC" }
  });
};

export const getQuoteStatusById = async (id) => {
  const status = await quoteStatusRepository.findOneBy({ id });
  if (!status) {
    throw new Error("Estado de cotización no encontrado");
  }
  return status;
};

export const getQuoteStatusByName = async (name) => {
  const status = await quoteStatusRepository.findOneBy({ name });
  if (!status) {
    throw new Error(`Estado de cotización '${name}' no encontrado`);
  }
  return status;
};

export const createQuoteStatus = async (data) => {
  const { name, description, colorCode, isEditable } = data;
  
  const existingStatus = await quoteStatusRepository.findOneBy({ name });
  if (existingStatus) {
    throw new Error("Ya existe un estado con este nombre");
  }

  const status = quoteStatusRepository.create({
    name,
    description,
    colorCode,
    isEditable: isEditable !== undefined ? isEditable : true
  });

  await quoteStatusRepository.save(status);
  return status;
};

export const updateQuoteStatus = async (id, data) => {
  const status = await quoteStatusRepository.findOneBy({ id });
  if (!status) {
    throw new Error("Estado de cotización no encontrado");
  }

  if (data.name && data.name !== status.name) {
    const existingStatus = await quoteStatusRepository.findOneBy({ name: data.name });
    if (existingStatus) {
      throw new Error("Ya existe un estado con este nombre");
    }
  }

  Object.assign(status, data);
  await quoteStatusRepository.save(status);
  return status;
};

export const deleteQuoteStatus = async (id) => {
  const status = await quoteStatusRepository.findOneBy({ id });
  if (!status) {
    throw new Error("Estado de cotización no encontrado");
  }

  await quoteStatusRepository.remove(status);
  return { message: "Estado eliminado correctamente" };
};
