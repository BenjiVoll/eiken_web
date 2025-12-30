"use strict";
import Joi from "joi";

export const productBodyValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(255)
        .required()
        .messages({
            "string.empty": "El nombre no puede estar vacío.",
            "any.required": "El nombre es obligatorio.",
            "string.min": "El nombre debe tener al menos 3 caracteres.",
            "string.max": "El nombre no puede exceder 255 caracteres.",
        }),
    description: Joi.string()
        .min(10)
        .max(1000)
        .required()
        .messages({
            "string.empty": "La descripción no puede estar vacía.",
            "any.required": "La descripción es obligatoria.",
            "string.min": "La descripción debe tener al menos 10 caracteres.",
            "string.max": "La descripción no puede exceder 1000 caracteres.",
        }),
    price: Joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "El precio debe ser un número.",
            "number.positive": "El precio debe ser mayor a 0.",
            "any.required": "El precio es obligatorio.",
        }),
    stock: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            "number.base": "El stock debe ser un número.",
            "number.integer": "El stock debe ser un número entero.",
            "number.min": "El stock no puede ser negativo.",
            "any.required": "El stock es obligatorio.",
        }),
    categoryId: Joi.number()
        .integer()
        .allow(null)
        .optional()
        .messages({
            "number.base": "La categoría debe ser un número.",
            "number.integer": "La categoría debe ser un número entero.",
        }),
    image: Joi.string()
        .allow(null, "")
        .optional(),
    isActive: Joi.boolean()
        .optional()
}).messages({
    "object.unknown": "No se permiten propiedades adicionales.",
});

export const productUpdateValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(255)
        .messages({
            "string.empty": "El nombre no puede estar vacío.",
            "string.min": "El nombre debe tener al menos 3 caracteres.",
            "string.max": "El nombre no puede exceder 255 caracteres.",
        }),
    description: Joi.string()
        .min(10)
        .max(1000)
        .messages({
            "string.empty": "La descripción no puede estar vacía.",
            "string.min": "La descripción debe tener al menos 10 caracteres.",
            "string.max": "La descripción no puede exceder 1000 caracteres.",
        }),
    price: Joi.number()
        .positive()
        .messages({
            "number.base": "El precio debe ser un número.",
            "number.positive": "El precio debe ser mayor a 0.",
        }),
    stock: Joi.number()
        .integer()
        .min(0)
        .messages({
            "number.base": "El stock debe ser un número.",
            "number.integer": "El stock debe ser un número entero.",
            "number.min": "El stock no puede ser negativo.",
        }),
    categoryId: Joi.number()
        .integer()
        .allow(null)
        .optional()
        .messages({
            "number.base": "La categoría debe ser un número.",
            "number.integer": "La categoría debe ser un número entero.",
        }),
    image: Joi.string()
        .allow(null, "")
        .optional(),
    isActive: Joi.boolean()
        .optional()
}).messages({
    "object.unknown": "No se permiten propiedades adicionales.",
});
