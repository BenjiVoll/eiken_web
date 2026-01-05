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
})
  .or("id", "name", "category")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un parámetro: id, name o category.",
  });

export const inventoryBodyValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "string.base": "El nombre debe ser de tipo string.",
      "string.min": "El nombre debe tener como mínimo 2 caracteres.",
      "string.max": "El nombre debe tener como máximo 255 caracteres.",
      "any.required": "El nombre es obligatorio.",
    }),
  type: Joi.string()
    .max(100)
    .required()
    .messages({
      "string.empty": "El tipo no puede estar vacío.",
      "string.base": "El tipo debe ser de tipo string.",
      "string.max": "El tipo debe tener como máximo 100 caracteres.",
      "any.required": "El tipo es obligatorio.",
    }),
  color: Joi.string()
    .max(100)
    .required()
    .messages({
      "string.empty": "El color no puede estar vacío.",
      "string.base": "El color debe ser de tipo string.",
      "string.max": "El color debe tener como máximo 100 caracteres.",
      "any.required": "El color es obligatorio.",
    }),
  brand: Joi.string()
    .max(100)
    .allow(null, '')
    .messages({
      "string.base": "La marca debe ser de tipo string.",
      "string.max": "La marca debe tener como máximo 100 caracteres.",
    }),
  model: Joi.string()
    .max(100)
    .allow(null, '')
    .messages({
      "string.base": "El modelo debe ser de tipo string.",
      "string.max": "El modelo debe tener como máximo 100 caracteres.",
    }),

  unit: Joi.string()
    .max(50)
    .default("metros")
    .messages({
      "string.base": "La unidad debe ser de tipo string.",
      "string.max": "La unidad debe tener como máximo 50 caracteres.",
    }),
  quantity: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      "number.base": "La cantidad debe ser un número.",
      "number.integer": "La cantidad debe ser un número entero.",
      "number.min": "La cantidad no puede ser negativa.",
      "any.required": "La cantidad es obligatoria.",
    }),
  minStock: Joi.number()
    .integer()
    .min(0)
    .default(5)
    .messages({
      "number.base": "El stock mínimo debe ser un número.",
      "number.integer": "El stock mínimo debe ser un número entero.",
      "number.min": "El stock mínimo no puede ser negativo.",
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

export const inventoryUpdateValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(255)
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "string.base": "El nombre debe ser de tipo string.",
      "string.min": "El nombre debe tener como mínimo 2 caracteres.",
      "string.max": "El nombre debe tener como máximo 255 caracteres.",
    }),
  type: Joi.string()
    .max(100)
    .messages({
      "string.empty": "El tipo no puede estar vacío.",
      "string.base": "El tipo debe ser de tipo string.",
      "string.max": "El tipo debe tener como máximo 100 caracteres.",
    }),
  color: Joi.string()
    .max(100)
    .messages({
      "string.empty": "El color no puede estar vacío.",
      "string.base": "El color debe ser de tipo string.",
      "string.max": "El color debe tener como máximo 100 caracteres.",
    }),
  brand: Joi.string()
    .max(100)
    .allow(null, '')
    .messages({
      "string.base": "La marca debe ser de tipo string.",
      "string.max": "La marca debe tener como máximo 100 caracteres.",
    }),
  model: Joi.string()
    .max(100)
    .allow(null, '')
    .messages({
      "string.base": "El modelo debe ser de tipo string.",
      "string.max": "El modelo debe tener como máximo 100 caracteres.",
    }),
  // width eliminado completamente
  unit: Joi.string()
    .max(50)
    .messages({
      "string.base": "La unidad debe ser de tipo string.",
      "string.max": "La unidad debe tener como máximo 50 caracteres.",
    }),
  quantity: Joi.number()
    .integer()
    .min(0)
    .messages({
      "number.base": "La cantidad debe ser un número.",
      "number.integer": "La cantidad debe ser un número entero.",
      "number.min": "La cantidad no puede ser negativa.",
    }),
  minStock: Joi.number()
    .integer()
    .min(0)
    .messages({
      "number.base": "El stock mínimo debe ser un número.",
      "number.integer": "El stock mínimo debe ser un número entero.",
      "number.min": "El stock mínimo no puede ser negativo.",
    }),
  isActive: Joi.boolean()
    .messages({
      "boolean.base": "El estado activo debe ser de tipo boolean.",
    }),
})
  .or("name", "type", "color", "brand", "model", "unit", "quantity", "minStock", "isActive")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing": "Debes proporcionar al menos un campo válido.",
  });
