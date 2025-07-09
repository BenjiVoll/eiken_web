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
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "string.base": "El nombre debe ser de tipo string.",
      "string.min": "El nombre debe tener como mínimo 2 caracteres.",
      "string.max": "El nombre debe tener como máximo 100 caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras y espacios.",
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
  address: Joi.string()
    .min(5)
    .max(200)
    .messages({
      "string.base": "La dirección debe ser de tipo string.",
      "string.min": "La dirección debe tener como mínimo 5 caracteres.",
      "string.max": "La dirección debe tener como máximo 200 caracteres.",
    }),
  company: Joi.string()
    .min(2)
    .max(100)
    .allow("")
    .messages({
      "string.base": "La empresa debe ser de tipo string.",
      "string.min": "La empresa debe tener como mínimo 2 caracteres.",
      "string.max": "La empresa debe tener como máximo 100 caracteres.",
    }),
})
  .or("name", "email", "phone", "address", "company")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo válido.",
  });
