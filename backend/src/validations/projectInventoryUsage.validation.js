"use strict";
import Joi from "joi";

export const projectInventoryUsageQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
  projectId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del proyecto debe ser un número.",
      "number.integer": "El id del proyecto debe ser un número entero.",
      "number.positive": "El id del proyecto debe ser un número positivo.",
    }),
  inventoryItemId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del item debe ser un número.",
      "number.integer": "El id del item debe ser un número entero.",
      "number.positive": "El id del item debe ser un número positivo.",
    }),
})
  .or("id", "projectId", "inventoryItemId")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro: id, projectId o inventoryItemId.",
  });

export const projectInventoryUsageBodyValidation = Joi.object({
  projectId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del proyecto debe ser un número.",
      "number.integer": "El id del proyecto debe ser un número entero.",
      "number.positive": "El id del proyecto debe ser un número positivo.",
    }),
  inventoryItemId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del item debe ser un número.",
      "number.integer": "El id del item debe ser un número entero.",
      "number.positive": "El id del item debe ser un número positivo.",
    }),
  quantityUsed: Joi.number()
    .positive()
    .messages({
      "number.base": "La cantidad usada debe ser un número.",
      "number.positive": "La cantidad usada debe ser un número positivo.",
    }),
  usedDate: Joi.date()
    .messages({
      "date.base": "La fecha de uso debe ser una fecha válida.",
    }),
  notes: Joi.string()
    .max(500)
    .allow("")
    .messages({
      "string.base": "Las notas deben ser de tipo string.",
      "string.max": "Las notas deben tener como máximo 500 caracteres.",
    }),
})
  .or("projectId", "inventoryItemId", "quantityUsed", "usedDate", "notes")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo válido.",
  });
