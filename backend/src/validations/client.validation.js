"use strict";
import Joi from "joi";

export const clientQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
  email: Joi.string()
    .min(5)
    .max(100)
    .email()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El correo electrónico debe ser válido.",
      "string.min": "El correo electrónico debe tener como mínimo 5 caracteres.",
      "string.max": "El correo electrónico debe tener como máximo 100 caracteres.",
    }),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s\-\(\)]{7,15}$/)
    .messages({
      "string.base": "El teléfono debe ser de tipo string.",
      "string.pattern.base": "El formato del teléfono no es válido.",
    }),
})
  .or("id", "email", "phone")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro: id, email o phone.",
  });

export const clientBodyValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(255)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "string.base": "El nombre debe ser de tipo string.",
      "string.min": "El nombre debe tener como mínimo 2 caracteres.",
      "string.max": "El nombre debe tener como máximo 255 caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras y espacios.",
      "any.required": "El nombre es obligatorio.",
    }),
  email: Joi.string()
    .min(5)
    .max(255)
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El correo electrónico debe ser válido.",
      "string.min": "El correo electrónico debe tener como mínimo 5 caracteres.",
      "string.max": "El correo electrónico debe tener como máximo 255 caracteres.",
      "any.required": "El correo electrónico es obligatorio.",
    }),
  phone: Joi.string()
    .max(50)
    .allow(null, '')
    .messages({
      "string.base": "El teléfono debe ser de tipo string.",
      "string.max": "El teléfono debe tener como máximo 50 caracteres.",
    }),
  company: Joi.string()
    .max(255)
    .allow(null, '')
    .messages({
      "string.base": "La empresa debe ser de tipo string.",
      "string.max": "La empresa debe tener como máximo 255 caracteres.",
    }),
  rut: Joi.string()
    .max(50)
    .allow(null, '')
    .messages({
      "string.base": "El RUT debe ser de tipo string.",
      "string.max": "El RUT debe tener como máximo 50 caracteres.",
    }),
  address: Joi.string()
    .allow(null, '')
    .messages({
      "string.base": "La dirección debe ser de tipo string.",
    }),
  clientType: Joi.string()
    .valid("individual", "company")
    .default("individual")
    .messages({
      "string.base": "El tipo de cliente debe ser de tipo string.",
      "any.only": "El tipo de cliente debe ser: individual o company.",
    }),
  isActive: Joi.boolean()
    .default(true)
    .messages({
      "boolean.base": "El estado activo debe ser de tipo boolean.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

export const clientUpdateValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(255)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "string.base": "El nombre debe ser de tipo string.",
      "string.min": "El nombre debe tener como mínimo 2 caracteres.",
      "string.max": "El nombre debe tener como máximo 255 caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras y espacios.",
    }),
  email: Joi.string()
    .min(5)
    .max(255)
    .email()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El correo electrónico debe ser válido.",
      "string.min": "El correo electrónico debe tener como mínimo 5 caracteres.",
      "string.max": "El correo electrónico debe tener como máximo 255 caracteres.",
    }),
  phone: Joi.string()
    .max(50)
    .allow(null, '')
    .messages({
      "string.base": "El teléfono debe ser de tipo string.",
      "string.max": "El teléfono debe tener como máximo 50 caracteres.",
    }),
  company: Joi.string()
    .max(255)
    .allow(null, '')
    .messages({
      "string.base": "La empresa debe ser de tipo string.",
      "string.max": "La empresa debe tener como máximo 255 caracteres.",
    }),
  rut: Joi.string()
    .max(50)
    .allow(null, '')
    .messages({
      "string.base": "El RUT debe ser de tipo string.",
      "string.max": "El RUT debe tener como máximo 50 caracteres.",
    }),
  address: Joi.string()
    .allow(null, '')
    .messages({
      "string.base": "La dirección debe ser de tipo string.",
    }),
  clientType: Joi.string()
    .valid("individual", "company")
    .messages({
      "string.base": "El tipo de cliente debe ser de tipo string.",
      "any.only": "El tipo de cliente debe ser: individual o company.",
    }),
  isActive: Joi.boolean()
    .messages({
      "boolean.base": "El estado activo debe ser de tipo boolean.",
    }),
})
  .or("name", "email", "phone", "company", "rut", "address", "clientType", "isActive")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo válido.",
  });
