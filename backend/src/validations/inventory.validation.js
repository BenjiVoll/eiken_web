"use strict";
import Joi from "joi";

export const inventoryQueryValidation = Joi.object({
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
    .min(2)
    .max(50)
    .messages({
      "string.base": "La categoría debe ser de tipo string.",
      "string.min": "La categoría debe tener como mínimo 2 caracteres.",
      "string.max": "La categoría debe tener como máximo 50 caracteres.",
    }),
  supplierId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del proveedor debe ser un número.",
      "number.integer": "El id del proveedor debe ser un número entero.",
      "number.positive": "El id del proveedor debe ser un número positivo.",
    }),
})
  .or("id", "name", "category", "supplierId")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro: id, name, category o supplierId.",
  });

export const inventoryBodyValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "string.base": "El nombre debe ser de tipo string.",
      "string.min": "El nombre debe tener como mínimo 2 caracteres.",
      "string.max": "El nombre debe tener como máximo 100 caracteres.",
    }),
  description: Joi.string()
    .max(500)
    .allow("")
    .messages({
      "string.base": "La descripción debe ser de tipo string.",
      "string.max": "La descripción debe tener como máximo 500 caracteres.",
    }),
  category: Joi.string()
    .min(2)
    .max(50)
    .messages({
      "string.base": "La categoría debe ser de tipo string.",
      "string.min": "La categoría debe tener como mínimo 2 caracteres.",
      "string.max": "La categoría debe tener como máximo 50 caracteres.",
    }),
  unit: Joi.string()
    .min(1)
    .max(20)
    .messages({
      "string.base": "La unidad debe ser de tipo string.",
      "string.min": "La unidad debe tener como mínimo 1 caracter.",
      "string.max": "La unidad debe tener como máximo 20 caracteres.",
    }),
  currentStock: Joi.number()
    .min(0)
    .messages({
      "number.base": "El stock actual debe ser un número.",
      "number.min": "El stock actual no puede ser negativo.",
    }),
  minStock: Joi.number()
    .min(0)
    .messages({
      "number.base": "El stock mínimo debe ser un número.",
      "number.min": "El stock mínimo no puede ser negativo.",
    }),
  maxStock: Joi.number()
    .min(0)
    .messages({
      "number.base": "El stock máximo debe ser un número.",
      "number.min": "El stock máximo no puede ser negativo.",
    }),
  unitCost: Joi.number()
    .positive()
    .precision(2)
    .messages({
      "number.base": "El costo unitario debe ser un número.",
      "number.positive": "El costo unitario debe ser un número positivo.",
    }),
  supplierId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id del proveedor debe ser un número.",
      "number.integer": "El id del proveedor debe ser un número entero.",
      "number.positive": "El id del proveedor debe ser un número positivo.",
    }),
  location: Joi.string()
    .max(100)
    .allow("")
    .messages({
      "string.base": "La ubicación debe ser de tipo string.",
      "string.max": "La ubicación debe tener como máximo 100 caracteres.",
    }),
})
  .or("name", "description", "category", "unit", "currentStock", "minStock", "maxStock", "unitCost", "supplierId", "location")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo válido.",
  });
