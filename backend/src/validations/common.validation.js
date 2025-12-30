"use strict";
import Joi from "joi";

/**
 * Validación común para parámetros ID en rutas
 * Usar con createParamsValidation() en las rutas
 */
export const idParamValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID debe ser un número",
            "number.integer": "El ID debe ser un número entero",
            "number.positive": "El ID debe ser positivo",
            "any.required": "El ID es obligatorio"
        })
});
