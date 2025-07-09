"use strict";
import Joi from "joi";

export const supplierQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .messages({
      "string.base": "El nombre debe ser de tipo string.",
      "string.min": "El nombre debe tener como mínimo 2 caracteres.",
      "string.max": "El nombre debe tener como máximo 100 caracteres.",
    }),
  email: Joi.string()
    .email()
    .messages({
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El correo electrónico debe ser válido.",
    }),
})
  .or("id", "name", "email")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro: id, name o email.",
  });

export const supplierBodyValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "string.base": "El nombre debe ser de tipo string.",
      "string.min": "El nombre debe tener como mínimo 2 caracteres.",
      "string.max": "El nombre debe tener como máximo 100 caracteres.",
    }),
  email: Joi.string()
    .email()
    .messages({
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El correo electrónico debe ser válido.",
    }),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s\-\(\)]{7,15}$/)
    .messages({
      "string.base": "El teléfono debe ser de tipo string.",
      "string.pattern.base": "El formato del teléfono no es válido.",
    }),
  address: Joi.string()
    .max(200)
    .allow("")
    .messages({
      "string.base": "La dirección debe ser de tipo string.",
      "string.max": "La dirección debe tener como máximo 200 caracteres.",
    }),
  contactPerson: Joi.string()
    .max(100)
    .allow("")
    .messages({
      "string.base": "La persona de contacto debe ser de tipo string.",
      "string.max": "La persona de contacto debe tener como máximo 100 caracteres.",
    }),
  website: Joi.string()
    .uri()
    .allow("")
    .messages({
      "string.base": "El sitio web debe ser de tipo string.",
      "string.uri": "El sitio web debe ser una URL válida.",
    }),
  notes: Joi.string()
    .max(500)
    .allow("")
    .messages({
      "string.base": "Las notas deben ser de tipo string.",
      "string.max": "Las notas deben tener como máximo 500 caracteres.",
    }),
})
  .or("name", "email", "phone", "address", "contactPerson", "website", "notes")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo válido.",
  });
