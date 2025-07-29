"use strict";
import Joi from "joi";

export const projectQueryValidation = Joi.object({
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
    .valid("pending", "in-progress", "approved", "completed", "cancelled")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: pending, in-progress, approved, completed, cancelled.",
    }),
  priority: Joi.string()
    .valid("low", "medium", "high", "urgent")
    .messages({
      "string.base": "La prioridad debe ser de tipo string.",
      "any.only": "La prioridad debe ser una de: low, medium, high, urgent.",
    }),
})
  .or("id", "clientId", "status", "priority")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro: id, clientId, status o priority.",
  });

export const projectBodyValidation = Joi.object({
  title: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      "string.empty": "El título no puede estar vacío.",
      "string.base": "El título debe ser de tipo string.",
      "string.min": "El título debe tener como mínimo 2 caracteres.",
      "string.max": "El título debe tener como máximo 255 caracteres.",
      "any.required": "El título es obligatorio.",
    }),
  description: Joi.string()
    .max(1000)
    .allow("")
    .messages({
      "string.base": "La descripción debe ser de tipo string.",
      "string.max": "La descripción debe tener como máximo 1000 caracteres.",
    }),
  clientId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El id del cliente debe ser un número.",
      "number.integer": "El id del cliente debe ser un número entero.",
      "number.positive": "El id del cliente debe ser un número positivo.",
      "any.required": "El id del cliente es obligatorio.",
    }),
  projectType: Joi.string()
    .valid("otro", "identidad-corporativa", "grafica-competicion", "wrap-vehicular")
    .required()
    .messages({
      "string.base": "El tipo de proyecto debe ser de tipo string.",
      "any.only": "El tipo de proyecto debe ser uno de: otro, identidad-corporativa, grafica-competicion, wrap-vehicular.",
      "any.required": "El tipo de proyecto es obligatorio.",
    }),
  division: Joi.string()
    .valid("design", "truck-design", "racing-design")
    .required()
    .messages({
      "string.base": "La división debe ser de tipo string.",
      "any.only": "La división debe ser una de: design, truck-design, racing-design.",
      "any.required": "La división es obligatoria.",
    }),
  status: Joi.string()
    .valid("pending", "in-progress", "approved", "completed", "cancelled")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: pending, in-progress, approved, completed, cancelled.",
    }),
  priority: Joi.string()
    .valid("low", "medium", "high", "urgent")
    .messages({
      "string.base": "La prioridad debe ser de tipo string.",
      "any.only": "La prioridad debe ser una de: low, medium, high, urgent.",
    }),
  budgetAmount: Joi.number()
    .positive()
    .precision(2)
    .allow(null)
    .messages({
      "number.base": "El monto del presupuesto debe ser un número.",
      "number.positive": "El monto del presupuesto debe ser un número positivo.",
    }),
  notes: Joi.string()
    .max(1000)
    .allow("")
    .messages({
      "string.base": "Las notas deben ser de tipo string.",
      "string.max": "Las notas deben tener como máximo 1000 caracteres.",
    }),
  quoteId: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      "number.base": "El id de la cotización debe ser un número.",
      "number.integer": "El id de la cotización debe ser un número entero.",
      "number.positive": "El id de la cotización debe ser un número positivo.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

// Validación específica para actualizaciones de proyectos (campos opcionales)
export const projectUpdateValidation = Joi.object({
  title: Joi.string()
    .min(2)
    .max(255)
    .messages({
      "string.empty": "El título no puede estar vacío.",
      "string.base": "El título debe ser de tipo string.",
      "string.min": "El título debe tener como mínimo 2 caracteres.",
      "string.max": "El título debe tener como máximo 255 caracteres.",
    }),
  description: Joi.string()
    .max(1000)
    .allow("")
    .messages({
      "string.base": "La descripción debe ser de tipo string.",
      "string.max": "La descripción debe tener como máximo 1000 caracteres.",
    }),
  clientId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del cliente debe ser un número.",
      "number.integer": "El id del cliente debe ser un número entero.",
      "number.positive": "El id del cliente debe ser un número positivo.",
    }),
  projectType: Joi.string()
    .valid("otro", "identidad-corporativa", "grafica-competicion", "wrap-vehicular")
    .messages({
      "string.base": "El tipo de proyecto debe ser de tipo string.",
      "any.only": "El tipo de proyecto debe ser uno de: otro, identidad-corporativa, grafica-competicion, wrap-vehicular.",
    }),
  division: Joi.string()
    .valid("design", "truck-design", "racing-design")
    .messages({
      "string.base": "La división debe ser de tipo string.",
      "any.only": "La división debe ser una de: design, truck-design, racing-design.",
    }),
  status: Joi.string()
    .valid("pending", "in-progress", "approved", "completed", "cancelled")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: pending, in-progress, approved, completed, cancelled.",
    }),
  priority: Joi.string()
    .valid("low", "medium", "high", "urgent")
    .messages({
      "string.base": "La prioridad debe ser de tipo string.",
      "any.only": "La prioridad debe ser una de: low, medium, high, urgent.",
    }),
  budgetAmount: Joi.number()
    .positive()
    .precision(2)
    .allow(null)
    .messages({
      "number.base": "El monto del presupuesto debe ser un número.",
      "number.positive": "El monto del presupuesto debe ser un número positivo.",
    }),
  notes: Joi.string()
    .max(1000)
    .allow("")
    .messages({
      "string.base": "Las notas deben ser de tipo string.",
      "string.max": "Las notas deben tener como máximo 1000 caracteres.",
    }),
  quoteId: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      "number.base": "El id de la cotización debe ser un número.",
      "number.integer": "El id de la cotización debe ser un número entero.",
      "number.positive": "El id de la cotización debe ser un número positivo.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
