"use strict";
import Joi from "joi";

export const inventoryMovementQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
  inventoryItemId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del item debe ser un número.",
      "number.integer": "El id del item debe ser un número entero.",
      "number.positive": "El id del item debe ser un número positivo.",
    }),
  movementType: Joi.string()
    .valid("in", "out", "adjustment")
    .messages({
      "string.base": "El tipo de movimiento debe ser de tipo string.",
      "any.only": "El tipo de movimiento debe ser uno de: in, out, adjustment.",
    }),
})
  .or("id", "inventoryItemId", "movementType")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro: id, inventoryItemId o movementType.",
  });

export const inventoryMovementBodyValidation = Joi.object({
  inventoryItemId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del item debe ser un número.",
      "number.integer": "El id del item debe ser un número entero.",
      "number.positive": "El id del item debe ser un número positivo.",
    }),
  movementType: Joi.string()
    .valid("in", "out", "adjustment")
    .messages({
      "string.base": "El tipo de movimiento debe ser de tipo string.",
      "any.only": "El tipo de movimiento debe ser uno de: in, out, adjustment.",
    }),
  quantity: Joi.number()
    .positive()
    .messages({
      "number.base": "La cantidad debe ser un número.",
      "number.positive": "La cantidad debe ser un número positivo.",
    }),
  unitCost: Joi.number()
    .positive()
    .precision(2)
    .messages({
      "number.base": "El costo unitario debe ser un número.",
      "number.positive": "El costo unitario debe ser un número positivo.",
    }),
  reason: Joi.string()
    .min(5)
    .max(200)
    .messages({
      "string.empty": "La razón no puede estar vacía.",
      "string.base": "La razón debe ser de tipo string.",
      "string.min": "La razón debe tener como mínimo 5 caracteres.",
      "string.max": "La razón debe tener como máximo 200 caracteres.",
    }),
  reference: Joi.string()
    .max(100)
    .allow("")
    .messages({
      "string.base": "La referencia debe ser de tipo string.",
      "string.max": "La referencia debe tener como máximo 100 caracteres.",
    }),
})
  .or("inventoryItemId", "movementType", "quantity", "unitCost", "reason", "reference")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo válido.",
  });
