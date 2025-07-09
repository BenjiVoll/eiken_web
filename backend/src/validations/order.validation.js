"use strict";
import Joi from "joi";

export const orderQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
  supplierId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del proveedor debe ser un número.",
      "number.integer": "El id del proveedor debe ser un número entero.",
      "number.positive": "El id del proveedor debe ser un número positivo.",
    }),
  status: Joi.string()
    .valid("pending", "sent", "confirmed", "received", "cancelled")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: pending, sent, confirmed, received, cancelled.",
    }),
})
  .or("id", "supplierId", "status")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro: id, supplierId o status.",
  });

export const orderBodyValidation = Joi.object({
  supplierId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del proveedor debe ser un número.",
      "number.integer": "El id del proveedor debe ser un número entero.",
      "number.positive": "El id del proveedor debe ser un número positivo.",
    }),
  orderDate: Joi.date()
    .messages({
      "date.base": "La fecha del pedido debe ser una fecha válida.",
    }),
  expectedDeliveryDate: Joi.date()
    .greater("now")
    .messages({
      "date.base": "La fecha de entrega esperada debe ser una fecha válida.",
      "date.greater": "La fecha de entrega esperada debe ser posterior a la fecha actual.",
    }),
  actualDeliveryDate: Joi.date()
    .messages({
      "date.base": "La fecha de entrega real debe ser una fecha válida.",
    }),
  totalAmount: Joi.number()
    .positive()
    .precision(2)
    .messages({
      "number.base": "El monto total debe ser un número.",
      "number.positive": "El monto total debe ser un número positivo.",
    }),
  status: Joi.string()
    .valid("pending", "sent", "confirmed", "received", "cancelled")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: pending, sent, confirmed, received, cancelled.",
    }),
  notes: Joi.string()
    .max(500)
    .allow("")
    .messages({
      "string.base": "Las notas deben ser de tipo string.",
      "string.max": "Las notas deben tener como máximo 500 caracteres.",
    }),
})
  .or("supplierId", "orderDate", "expectedDeliveryDate", "actualDeliveryDate", "totalAmount", "status", "notes")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo válido.",
  });
