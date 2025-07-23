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
  clientEmail: Joi.string()
    .email()
    .messages({
      "string.base": "El email del cliente debe ser de tipo string.",
      "string.email": "El email del cliente debe ser un email válido.",
    }),
  status: Joi.string()
    .valid("pending", "reviewing", "quoted", "approved", "rejected")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: pending, reviewing, quoted, approved, rejected.",
    }),
  urgency: Joi.string()
    .valid("low", "medium", "high", "urgent")
    .messages({
      "string.base": "La urgencia debe ser de tipo string.",
      "any.only": "La urgencia debe ser uno de: low, medium, high, urgent.",
    }),
  serviceType: Joi.string()
    .valid("otro", "identidad-corporativa", "grafica-competicion", "wrap-vehicular")
    .messages({
      "string.base": "El tipo de servicio debe ser de tipo string.",
      "any.only": "El tipo de servicio debe ser uno de: otro, identidad-corporativa, grafica-competicion, wrap-vehicular.",
    }),
})
  .or("id", "clientEmail", "status", "urgency", "serviceType")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro: id, clientEmail, status, urgency o serviceType.",
  });

export const quoteBodyValidation = Joi.object({
  clientName: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      "string.empty": "El nombre del cliente no puede estar vacío.",
      "string.base": "El nombre del cliente debe ser de tipo string.",
      "string.min": "El nombre del cliente debe tener como mínimo 2 caracteres.",
      "string.max": "El nombre del cliente debe tener como máximo 255 caracteres.",
      "any.required": "El nombre del cliente es obligatorio.",
    }),
  clientEmail: Joi.string()
    .email()
    .max(255)
    .required()
    .messages({
      "string.empty": "El email del cliente no puede estar vacío.",
      "string.base": "El email del cliente debe ser de tipo string.",
      "string.email": "El email del cliente debe ser un email válido.",
      "string.max": "El email del cliente debe tener como máximo 255 caracteres.",
      "any.required": "El email del cliente es obligatorio.",
    }),
  clientPhone: Joi.string()
    .max(50)
    .required()
    .messages({
      "string.empty": "El teléfono del cliente no puede estar vacío.",
      "string.base": "El teléfono del cliente debe ser de tipo string.",
      "string.max": "El teléfono del cliente debe tener como máximo 50 caracteres.",
      "any.required": "El teléfono del cliente es obligatorio.",
    }),
  company: Joi.string()
    .max(255)
    .allow('')
    .messages({
      "string.base": "La empresa debe ser de tipo string.",
      "string.max": "La empresa debe tener como máximo 255 caracteres.",
    }),
  serviceId: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      "number.base": "El id del servicio debe ser un número.",
      "number.integer": "El id del servicio debe ser un número entero.",
      "number.positive": "El id del servicio debe ser un número positivo.",
    }),
  customServiceTitle: Joi.string()
    .max(255)
    .allow(null, '')
    .messages({
      "string.base": "El título del servicio personalizado debe ser de tipo string.",
      "string.max": "El título del servicio personalizado debe tener como máximo 255 caracteres.",
    }),
  serviceType: Joi.string()
    .valid("otro", "identidad-corporativa", "grafica-competicion", "wrap-vehicular")
    .required()
    .messages({
      "string.base": "El tipo de servicio debe ser de tipo string.",
      "any.only": "El tipo de servicio debe ser uno de: otro, identidad-corporativa, grafica-competicion, wrap-vehicular.",
      "any.required": "El tipo de servicio es obligatorio.",
    }),
  description: Joi.string()
    .min(10)
    .required()
    .messages({
      "string.empty": "La descripción no puede estar vacía.",
      "string.base": "La descripción debe ser de tipo string.",
      "string.min": "La descripción debe tener como mínimo 10 caracteres.",
      "any.required": "La descripción es obligatoria.",
    }),
  urgency: Joi.string()
    .valid("low", "medium", "high", "urgent")
    .default("medium")
    .messages({
      "string.base": "La urgencia debe ser de tipo string.",
      "any.only": "La urgencia debe ser uno de: low, medium, high, urgent.",
    }),
  status: Joi.string()
    .valid("pending", "reviewing", "quoted", "approved", "rejected")
    .default("pending")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: pending, reviewing, quoted, approved, rejected.",
    }),
  quotedAmount: Joi.number()
    .positive()
    .precision(2)
    .allow(null)
    .messages({
      "number.base": "El monto cotizado debe ser un número.",
      "number.positive": "El monto cotizado debe ser un número positivo.",
    }),
  notes: Joi.string()
    .allow('', null)
    .messages({
      "string.base": "Las notas deben ser de tipo string.",
    }),
})
  .custom((value, helpers) => {
    // Debe tener serviceId o customServiceTitle
    if (!value.serviceId && !value.customServiceTitle) {
      return helpers.error('any.custom', { 
        message: 'Debe especificar un servicio del catálogo (serviceId) o un título personalizado (customServiceTitle).' 
      });
    }
    return value;
  })
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

export const quoteUpdateValidation = Joi.object({
  clientName: Joi.string()
    .min(1)
    .max(255)
    .trim()
    .messages({
      "string.base": "El nombre del cliente debe ser de tipo string.",
      "string.min": "El nombre del cliente debe tener al menos 1 carácter.",
      "string.max": "El nombre del cliente no puede tener más de 255 caracteres.",
    }),
  clientEmail: Joi.string()
    .email()
    .max(255)
    .trim()
    .messages({
      "string.base": "El email del cliente debe ser de tipo string.",
      "string.email": "El email del cliente debe ser un email válido.",
      "string.max": "El email del cliente no puede tener más de 255 caracteres.",
    }),
  clientPhone: Joi.string()
    .max(50)
    .trim()
    .allow("")
    .messages({
      "string.base": "El teléfono del cliente debe ser de tipo string.",
      "string.max": "El teléfono del cliente no puede tener más de 50 caracteres.",
    }),
  company: Joi.string()
    .max(255)
    .trim()
    .allow("")
    .messages({
      "string.base": "La empresa debe ser de tipo string.",
      "string.max": "La empresa no puede tener más de 255 caracteres.",
    }),
  serviceType: Joi.string()
    .valid("otro", "identidad-corporativa", "grafica-competicion", "wrap-vehicular")
    .messages({
      "string.base": "El tipo de servicio debe ser de tipo string.",
      "any.only": "El tipo de servicio debe ser uno de: otro, identidad-corporativa, grafica-competicion, wrap-vehicular.",
    }),
  urgency: Joi.string()
    .valid("baja", "media", "alta", "urgente")
    .messages({
      "string.base": "La urgencia debe ser de tipo string.",
      "any.only": "La urgencia debe ser uno de: baja, media, alta, urgente.",
    }),
  description: Joi.string()
    .min(10)
    .messages({
      "string.base": "La descripción debe ser de tipo string.",
      "string.min": "La descripción debe tener al menos 10 caracteres.",
    }),
  serviceId: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      "number.base": "El id del servicio debe ser un número.",
      "number.integer": "El id del servicio debe ser un número entero.",
      "number.positive": "El id del servicio debe ser un número positivo.",
    }),
  customServiceTitle: Joi.string()
    .max(255)
    .allow(null, '')
    .messages({
      "string.base": "El título del servicio personalizado debe ser de tipo string.",
      "string.max": "El título del servicio personalizado debe tener como máximo 255 caracteres.",
    }),
  notes: Joi.string()
    .allow('', null)
    .messages({
      "string.base": "Las notas deben ser de tipo string.",
    }),
  status: Joi.string()
    .valid("pending", "reviewing", "quoted", "approved", "rejected")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: pending, reviewing, quoted, approved, rejected.",
    }),
  quotedAmount: Joi.number()
    .positive()
    .precision(2)
    .allow(null)
    .messages({
      "number.base": "El monto cotizado debe ser un número.",
      "number.positive": "El monto cotizado debe ser un número positivo.",
      "number.precision": "El monto cotizado debe tener máximo 2 decimales.",
    }),
})
  .min(1)
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.min": "Debes proporcionar al menos un campo válido para actualizar.",
  });
