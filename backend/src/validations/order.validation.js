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
  clientId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del cliente debe ser un número.",
      "number.integer": "El id del cliente debe ser un número entero.",
      "number.positive": "El id del cliente debe ser un número positivo.",
    }),
  clientEmail: Joi.string()
    .email()
    .messages({
      "string.base": "El email del cliente debe ser de tipo string.",
      "string.email": "El email del cliente debe ser un email válido.",
    }),
  status: Joi.string()
    .valid("pending", "processing", "completed", "cancelled")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: pending, processing, completed, cancelled.",
    }),
})
  .or("id", "clientId", "clientEmail", "status")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro: id, clientId, clientEmail o status.",
  });

export const orderBodyValidation = Joi.object({
  clientId: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      "number.base": "El id del cliente debe ser un número.",
      "number.integer": "El id del cliente debe ser un número entero.",
      "number.positive": "El id del cliente debe ser un número positivo.",
    }),
  clientEmail: Joi.string()
    .email()
    .max(255)
    .allow(null)
    .messages({
      "string.base": "El email del cliente debe ser de tipo string.",
      "string.email": "El email del cliente debe ser un email válido.",
      "string.max": "El email del cliente debe tener como máximo 255 caracteres.",
    }),
  clientName: Joi.string()
    .max(255)
    .allow(null)
    .messages({
      "string.base": "El nombre del cliente debe ser de tipo string.",
      "string.max": "El nombre del cliente debe tener como máximo 255 caracteres.",
    }),
  totalAmount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      "number.base": "El monto total debe ser un número.",
      "number.positive": "El monto total debe ser un número positivo.",
      "any.required": "El monto total es obligatorio.",
    }),
  status: Joi.string()
    .valid("pending", "processing", "completed", "cancelled")
    .default("pending")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: pending, processing, completed, cancelled.",
    }),
  orderDate: Joi.date()
    .default(() => new Date())
    .messages({
      "date.base": "La fecha del pedido debe ser una fecha válida.",
    }),
  notes: Joi.string()
    .allow(null, '')
    .messages({
      "string.base": "Las notas deben ser de tipo string.",
    }),
})
  .custom((value, helpers) => {
    // Debe tener clientId o clientEmail/clientName
    if (!value.clientId && (!value.clientEmail || !value.clientName)) {
      return helpers.error('any.custom', { 
        message: 'Debe especificar un clientId o proporcionar clientEmail y clientName.' 
      });
    }
    return value;
  })
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
