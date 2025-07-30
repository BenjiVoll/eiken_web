import Joi from "joi";

export const categoryBodyValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.base": "El nombre debe ser un texto",
      "string.empty": "El nombre es obligatorio",
      "string.min": "El nombre debe tener al menos 2 caracteres",
      "string.max": "El nombre no puede superar los 100 caracteres",
      "any.required": "El nombre es obligatorio"
    })
});

export const categoryUpdateValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.base": "El nombre debe ser un texto",
      "string.empty": "El nombre es obligatorio",
      "string.min": "El nombre debe tener al menos 2 caracteres",
      "string.max": "El nombre no puede superar los 100 caracteres",
      "any.required": "El nombre es obligatorio"
    })
});
