"use strict";
import Joi from "joi";

export const authValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "any.required": "El correo electrónico es obligatorio.",
      "string.base": "El correo electrónico debe ser de tipo texto.",
      "string.email": "Debe ser un correo electrónico válido.",
    }),
  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatoria.",
      "string.base": "La contraseña debe ser de tipo texto.",
      "string.min": "La contraseña debe tener al menos 6 caracteres.",
      "string.max": "La contraseña debe tener como máximo 50 caracteres.",
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

export const registerValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "any.required": "El nombre es obligatorio.",
      "string.base": "El nombre debe ser de tipo texto.",
      "string.min": "El nombre debe tener al menos 2 caracteres.",
      "string.max": "El nombre debe tener como máximo 100 caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras y espacios.",
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "any.required": "El correo electrónico es obligatorio.",
      "string.base": "El correo electrónico debe ser de tipo texto.",
      "string.email": "Debe ser un correo electrónico válido.",
    }),
  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatoria.",
      "string.base": "La contraseña debe ser de tipo texto.",
      "string.min": "La contraseña debe tener al menos 6 caracteres.",
      "string.max": "La contraseña debe tener como máximo 50 caracteres.",
    }),
  role: Joi.string()
    .valid("admin", "manager", "designer", "operator")
    .optional()
    .messages({
      "any.only": "El rol debe ser uno de: admin, manager, designer, operator.",
    }),
})
  .unknown(false)
  .messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});