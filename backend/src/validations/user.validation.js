"use strict";
import Joi from "joi";

export const userQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
  email: Joi.string()
    .email()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El correo electrónico debe ser válido.",
    }),
})
  .or("id", "email")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un parámetro: id o email.",
  });

export const userBodyValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "string.base": "El nombre debe ser de tipo string.",
      "string.min": "El nombre debe tener como mínimo 2 caracteres.",
      "string.max": "El nombre debe tener como máximo 100 caracteres.",
      "string.pattern.base":
        "El nombre solo puede contener letras y espacios.",
    }),
  email: Joi.string()
    .email()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "string.base": "El correo electrónico debe ser de tipo string.",
      "string.email": "El correo electrónico debe ser válido.",
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "string.base": "La contraseña debe ser de tipo string.",
      "string.min": "La contraseña debe tener como mínimo 6 caracteres.",
      "string.max": "La contraseña debe tener como máximo 100 caracteres.",
    }),
  newPassword: Joi.string()
    .min(6)
    .max(100)
    .allow("")
    .messages({
      "string.empty": "La nueva contraseña no puede estar vacía.",
      "string.base": "La nueva contraseña debe ser de tipo string.",
      "string.min": "La nueva contraseña debe tener como mínimo 6 caracteres.",
      "string.max": "La nueva contraseña debe tener como máximo 100 caracteres.",
    }),
  role: Joi.string()
    .valid("admin", "manager", "designer", "operator")
    .messages({
      "string.base": "El rol debe ser de tipo string.",
      "any.only": "El rol debe ser uno de: admin, manager, designer, operator.",
    }),
})
  .or("name", "email", "password", "newPassword", "role")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un campo: name, email, password, newPassword o role.",
  });
