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
    .valid("planning", "in_progress", "on_hold", "completed", "cancelled")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: planning, in_progress, on_hold, completed, cancelled.",
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
  name: Joi.string()
    .min(2)
    .max(200)
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "string.base": "El nombre debe ser de tipo string.",
      "string.min": "El nombre debe tener como mínimo 2 caracteres.",
      "string.max": "El nombre debe tener como máximo 200 caracteres.",
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
  serviceId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del servicio debe ser un número.",
      "number.integer": "El id del servicio debe ser un número entero.",
      "number.positive": "El id del servicio debe ser un número positivo.",
    }),
  startDate: Joi.date()
    .messages({
      "date.base": "La fecha de inicio debe ser una fecha válida.",
    }),
  endDate: Joi.date()
    .greater(Joi.ref("startDate"))
    .messages({
      "date.base": "La fecha de fin debe ser una fecha válida.",
      "date.greater": "La fecha de fin debe ser posterior a la fecha de inicio.",
    }),
  estimatedHours: Joi.number()
    .positive()
    .messages({
      "number.base": "Las horas estimadas deben ser un número.",
      "number.positive": "Las horas estimadas deben ser un número positivo.",
    }),
  actualHours: Joi.number()
    .min(0)
    .messages({
      "number.base": "Las horas reales deben ser un número.",
      "number.min": "Las horas reales no pueden ser negativas.",
    }),
  budgetAmount: Joi.number()
    .positive()
    .precision(2)
    .messages({
      "number.base": "El presupuesto debe ser un número.",
      "number.positive": "El presupuesto debe ser un número positivo.",
    }),
  actualCost: Joi.number()
    .min(0)
    .precision(2)
    .messages({
      "number.base": "El costo real debe ser un número.",
      "number.min": "El costo real no puede ser negativo.",
    }),
  status: Joi.string()
    .valid("planning", "in_progress", "on_hold", "completed", "cancelled")
    .messages({
      "string.base": "El estado debe ser de tipo string.",
      "any.only": "El estado debe ser uno de: planning, in_progress, on_hold, completed, cancelled.",
    }),
  priority: Joi.string()
    .valid("low", "medium", "high", "urgent")
    .messages({
      "string.base": "La prioridad debe ser de tipo string.",
      "any.only": "La prioridad debe ser una de: low, medium, high, urgent.",
    }),
  notes: Joi.string()
    .max(1000)
    .allow("")
    .messages({
      "string.base": "Las notas deben ser de tipo string.",
      "string.max": "Las notas deben tener como máximo 1000 caracteres.",
    }),
})
  .or("name", "description", "clientId", "serviceId", "startDate", "endDate", "estimatedHours", "actualHours", "budgetAmount", "actualCost", "status", "priority", "notes")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo válido.",
  });
