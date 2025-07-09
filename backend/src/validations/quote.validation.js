"use strict";
import Joi from "joi";

export const quoteQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
  clientId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del cliente debe ser un número.",
      "number.integer": "El id del cliente debe ser un número entero.",
      "number.positive": "El id del cliente debe ser un número positivo.",
    }),
  status: Joi.string()
    .valid("draft", "sent", "approved", "rejected", "expired")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: draft, sent, approved, rejected, expired.",
    }),
})
  .or("id", "clientId", "status")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro: id, clientId o status.",
  });

export const quoteBodyValidation = Joi.object({
  clientId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del cliente debe ser un número.",
      "number.integer": "El id del cliente debe ser un número entero.",
      "number.positive": "El id del cliente debe ser un número positivo.",
    }),
  serviceId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del servicio debe ser un número.",
      "number.integer": "El id del servicio debe ser un número entero.",
      "number.positive": "El id del servicio debe ser un número positivo.",
    }),
  description: Joi.string()
    .min(10)
    .max(1000)
    .messages({
      "string.base": "La descripción debe ser de tipo string.",
      "string.min": "La descripción debe tener como mínimo 10 caracteres.",
      "string.max": "La descripción debe tener como máximo 1000 caracteres.",
    }),
  totalAmount: Joi.number()
    .positive()
    .precision(2)
    .messages({
      "number.base": "El monto total debe ser un número.",
      "number.positive": "El monto total debe ser un número positivo.",
    }),
  discount: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .messages({
      "number.base": "El descuento debe ser un número.",
      "number.min": "El descuento no puede ser negativo.",
      "number.max": "El descuento no puede ser mayor a 100%.",
    }),
  validUntil: Joi.date()
    .greater("now")
    .messages({
      "date.base": "La fecha de validez debe ser una fecha válida.",
      "date.greater": "La fecha de validez debe ser posterior a la fecha actual.",
    }),
  status: Joi.string()
    .valid("draft", "sent", "approved", "rejected", "expired")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: draft, sent, approved, rejected, expired.",
    }),
  notes: Joi.string()
    .max(500)
    .allow("")
    .messages({
      "string.base": "Las notas deben ser de tipo string.",
      "string.max": "Las notas deben tener como máximo 500 caracteres.",
    }),
})
  .or("clientId", "serviceId", "description", "totalAmount", "discount", "validUntil", "status", "notes")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo válido.",
  });
