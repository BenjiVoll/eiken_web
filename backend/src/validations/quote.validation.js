"use strict";
import Joi from "joi";

export const quoteBodyValidation = Joi.object({
  clientName: Joi.string()
    .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/)
    .min(2)
    .max(255)
    .required()
    .messages({
      "string.pattern.base": "El nombre solo debe contener letras y espacios.",
      "string.min": "El nombre debe tener al menos 2 caracteres.",
      "string.max": "El nombre no puede tener más de 255 caracteres.",
      "any.required": "El nombre es obligatorio."
    }),
  clientEmail: Joi.string().email().max(255).required(),
  clientPhone: Joi.string()
    .pattern(/^(\+56\d{9})$/)
    .max(12)
    .required()
    .messages({
      "string.pattern.base": "El teléfono debe tener el formato +56 seguido de 9 números.",
      "string.max": "El teléfono no puede tener más de 12 caracteres.",
      "any.required": "El teléfono es obligatorio."
    }),
  company: Joi.string().max(255).allow(null, ''),
  service: Joi.number().integer().allow(null),
  customServiceTitle: Joi.string().max(255).allow(null, ''),
  categoryId: Joi.number().integer().allow(null),
  description: Joi.string().min(10).required().messages({
    "string.empty": "La descripción no puede estar vacía.",
    "string.base": "La descripción debe ser de tipo string.",
    "string.min": "La descripción debe tener como mínimo 10 caracteres.",
    "any.required": "La descripción es obligatoria."
  }),
  urgency: Joi.string().valid('Bajo', 'Medio', 'Alto', 'Urgente').required().messages({
    "string.base": "La urgencia debe ser de tipo string.",
    "any.only": "La urgencia debe ser uno de: Bajo, Medio, Alto, Urgente."
  }),
  status: Joi.string().valid('Pendiente', 'En Revisión', 'Cotizado', 'Aprobado', 'Rechazado', 'Convertido').required().messages({
    "string.base": "El estado debe ser de tipo string.",
    "any.only": "El estado debe ser uno de: Pendiente, En Revisión, Cotizado, Aprobado, Rechazado, Convertido."
  }),
  quotedAmount: Joi.number().precision(2).allow(null),
  notes: Joi.string().allow(null, ''),
})
  .custom((value, helpers) => {
    // Debe tener service o customServiceTitle
    if (!value.service && !value.customServiceTitle) {
      return helpers.error('any.custom', {
        message: 'Debe especificar un servicio del catálogo (service) o un título personalizado (customServiceTitle).'
      });
    }
    return value;
  })
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales."
  });

export const quoteUpdateValidation = Joi.object({
  clientName: Joi.string()
    .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/)
    .min(1)
    .max(255)
    .trim()
    .messages({
      "string.pattern.base": "El nombre solo debe contener letras y espacios.",
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
    .pattern(/^(\+56\d{9})$/)
    .max(12)
    .trim()
    .allow("")
    .messages({
      "string.pattern.base": "El teléfono debe tener el formato +56 seguido de 9 números.",
      "string.max": "El teléfono no puede tener más de 12 caracteres.",
    }),
  company: Joi.string()
    .max(255)
    .trim()
    .allow("")
    .messages({
      "string.base": "La empresa debe ser de tipo string.",
      "string.max": "La empresa no puede tener más de 255 caracteres.",
    }),
  categoryId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id de la categoría debe ser un número.",
      "number.integer": "El id de la categoría debe ser un número entero.",
      "number.positive": "El id de la categoría debe ser un número positivo.",
    }),
  urgency: Joi.string()
    .valid("Bajo", "Medio", "Alto", "Urgente")
    .messages({
      "string.base": "La urgencia debe ser de tipo string.",
      "any.only": "La urgencia debe ser uno de: Bajo, Medio, Alto, Urgente.",
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
    .valid("Pendiente", "Revisando", "Cotizado", "Aprobado", "Rechazado", "Convertido")
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
      "number.precision": "El monto cotizado debe tener máximo 2 decimales.",
    }),
})
  .min(1)
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.min": "Debes proporcionar al menos un campo válido para actualizar.",
  });
