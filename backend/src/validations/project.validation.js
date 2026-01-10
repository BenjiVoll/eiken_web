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
  categoryId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id de categoría debe ser un número.",
      "number.integer": "El id de categoría debe ser un número entero.",
      "number.positive": "El id de categoría debe ser un número positivo.",
    }),
  division: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id de división debe ser un número.",
      "number.integer": "El id de división debe ser un número entero.",
      "number.positive": "El id de división debe ser un número positivo.",
    }),
  status: Joi.string()
    .valid("Pendiente", "En Proceso", "Aprobado", "Completado", "Cancelado")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: Pendiente, En Proceso, Aprobado, Completado, Cancelado.",
    }),
  priority: Joi.string()
    .valid("Bajo", "Medio", "Alto", "Urgente")
    .messages({
      "string.base": "La prioridad debe ser de tipo string.",
      "any.only": "La prioridad debe ser una de: Bajo, Medio, Alto, Urgente.",
    }),
})
  .or("id", "clientId", "categoryId", "division", "status", "priority")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro: id, clientId, categoryId, division, status o priority.",
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
    .allow('', null)
    .messages({
      "number.base": "El id del cliente debe ser un número.",
      "number.integer": "El id del cliente debe ser un número entero.",
      "number.positive": "El id del cliente debe ser un número positivo.",
    }),
  clientName: Joi.string()
    .max(255)
    .allow('')
    .messages({
      "string.base": "El nombre del cliente debe ser de tipo string.",
      "string.max": "El nombre del cliente debe tener como máximo 255 caracteres.",
    }),
  categoryId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El id de categoría debe ser un número.",
      "number.integer": "El id de categoría debe ser un número entero.",
      "number.positive": "El id de categoría debe ser un número positivo.",
      "any.required": "La categoría es obligatoria.",
    }),
  division: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El id de división debe ser un número.",
      "number.integer": "El id de división debe ser un número entero.",
      "number.positive": "El id de división debe ser un número positivo.",
      "any.required": "La división es obligatoria.",
    }),
  status: Joi.string()
    .valid("Pendiente", "En Proceso", "Aprobado", "Completado", "Cancelado")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: Pendiente, En Proceso, Aprobado, Completado, Cancelado.",
    }),
  priority: Joi.string()
    .valid("Bajo", "Medio", "Alto", "Urgente")
    .messages({
      "string.base": "La prioridad debe ser de tipo string.",
      "any.only": "La prioridad debe ser una de: Bajo, Medio, Alto, Urgente.",
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
  isFeatured: Joi.boolean()
    .messages({
      "boolean.base": "El campo isFeatured debe ser un valor booleano.",
    }),
  quoteId: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      "number.base": "El id de cotización debe ser un número.",
    }),
})
  .or('clientId', 'clientName')
  .messages({
    "object.missing": "Debe proporcionar un cliente (clientId o clientName).",
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
  categoryId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id de categoría debe ser un número.",
      "number.integer": "El id de categoría debe ser un número entero.",
      "number.positive": "El id de categoría debe ser un número positivo.",
    }),
  division: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id de división debe ser un número.",
      "number.integer": "El id de división debe ser un número entero.",
      "number.positive": "El id de división debe ser un número positivo.",
    }),
  status: Joi.string()
    .valid("Pendiente", "En Proceso", "Aprobado", "Completado", "Cancelado")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: Pendiente, En Proceso, Aprobado, Completado, Cancelado.",
    }),
  priority: Joi.string()
    .valid("Bajo", "Medio", "Alto", "Urgente")
    .messages({
      "string.base": "La prioridad debe ser de tipo string.",
      "any.only": "La prioridad debe ser una de: Bajo, Medio, Alto, Urgente.",
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
  isFeatured: Joi.boolean()
    .messages({
      "boolean.base": "El campo isFeatured debe ser un valor booleano.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
