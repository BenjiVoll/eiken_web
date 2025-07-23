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
    .valid("Pendiente", "Revisando", "Cotizado", "Aprobado", "Rechazado")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: Pendiente, Revisando, Cotizado, Aprobado, Rechazado.",
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
    .valid("Pendiente", "Revisando", "Cotizado", "Aprobado", "Rechazado")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: Pendiente, Revisando, Cotizado, Aprobado, Rechazado.",
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
  .custom((value, helpers) => {
    // Para nuevas cotizaciones, debe haber al menos serviceId o customServiceTitle
    if (!value.serviceId && !value.customServiceTitle) {
      return helpers.error('any.custom', { message: 'Debe especificar un servicio del catálogo (serviceId) o un título personalizado (customServiceTitle).' });
    }
    return value;
  })
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo válido.",
  });

export const quoteUpdateValidation = Joi.object({
  clientName: Joi.string()
    .min(2)
    .max(255)
    .messages({
      "string.base": "El nombre del cliente debe ser de tipo string.",
      "string.min": "El nombre del cliente debe tener como mínimo 2 caracteres.",
      "string.max": "El nombre del cliente debe tener como máximo 255 caracteres.",
    }),
  clientEmail: Joi.string()
    .email()
    .max(255)
    .messages({
      "string.base": "El email del cliente debe ser de tipo string.",
      "string.email": "El email del cliente debe ser un email válido.",
      "string.max": "El email del cliente debe tener como máximo 255 caracteres.",
    }),
  clientPhone: Joi.string()
    .max(50)
    .messages({
      "string.base": "El teléfono del cliente debe ser de tipo string.",
      "string.max": "El teléfono del cliente debe tener como máximo 50 caracteres.",
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
      "string.base": "El título personalizado del servicio debe ser de tipo string.",
      "string.max": "El título personalizado del servicio debe tener como máximo 255 caracteres.",
    }),
  serviceType: Joi.string()
    .valid("otro", "identidad-corporativa", "grafica-competicion", "wrap-vehicular")
    .messages({
      "string.base": "El tipo de servicio debe ser de tipo string.",
      "any.only": "El tipo de servicio debe ser uno de: otro, identidad-corporativa, grafica-competicion, wrap-vehicular.",
    }),
  description: Joi.string()
    .max(1000)
    .messages({
      "string.base": "La descripción debe ser de tipo string.",
      "string.max": "La descripción debe tener como máximo 1000 caracteres.",
    }),
  urgency: Joi.string()
    .valid("Baja", "Media", "Alta", "Urgente")
    .messages({
      "string.base": "La urgencia debe ser de tipo string.",
      "any.only": "La urgencia debe ser uno de: Baja, Media, Alta, Urgente.",
    }),
  status: Joi.string()
    .valid("Pendiente", "Revisando", "Cotizado", "Aprobado", "Rechazado")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: Pendiente, Revisando, Cotizado, Aprobado, Rechazado.",
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
    .max(500)
    .allow('')
    .messages({
      "string.base": "Las notas deben ser de tipo string.",
      "string.max": "Las notas deben tener como máximo 500 caracteres.",
    }),
})
  .min(1)
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.min": "Debes proporcionar al menos un campo válido para actualizar.",
  });
