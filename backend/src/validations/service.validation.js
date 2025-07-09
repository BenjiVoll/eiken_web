"use strict";
import Joi from "joi";

export const serviceQueryValidation = Joi.object({
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
  category: Joi.string()
    .messages({
      "string.base": "La categoría debe ser de tipo string.",
    }),
  division: Joi.string()
    .valid("Design", "Truck Design", "Racing Design")
    .messages({
      "string.base": "La división debe ser de tipo string.",
      "any.only": "La división debe ser una de: Design, Truck Design, Racing Design.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

export const serviceBodyValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "any.required": "El nombre es obligatorio.",
      "string.base": "El nombre debe ser de tipo string.",
      "string.min": "El nombre debe tener como mínimo 2 caracteres.",
      "string.max": "El nombre debe tener como máximo 255 caracteres.",
    }),
  description: Joi.string()
    .min(10)
    .max(1000)
    .optional()
    .messages({
      "string.base": "La descripción debe ser de tipo string.",
      "string.min": "La descripción debe tener como mínimo 10 caracteres.",
      "string.max": "La descripción debe tener como máximo 1000 caracteres.",
    }),
  category: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "La categoría no puede estar vacía.",
      "any.required": "La categoría es obligatoria.",
      "string.base": "La categoría debe ser de tipo string.",
      "string.min": "La categoría debe tener como mínimo 2 caracteres.",
      "string.max": "La categoría debe tener como máximo 100 caracteres.",
    }),
  division: Joi.string()
    .valid("Design", "Truck Design", "Racing Design")
    .required()
    .messages({
      "string.empty": "La división no puede estar vacía.",
      "any.required": "La división es obligatoria.",
      "string.base": "La división debe ser de tipo string.",
      "any.only": "La división debe ser una de: Design, Truck Design, Racing Design.",
    }),
  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      "number.base": "El precio debe ser un número.",
      "number.positive": "El precio debe ser un número positivo.",
      "any.required": "El precio es obligatorio.",
    }),
  isActive: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": "isActive debe ser un valor booleano.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
