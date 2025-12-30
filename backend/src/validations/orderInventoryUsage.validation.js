import Joi from "joi";

export const materialUsageValidation = Joi.object({
    materials: Joi.array()
        .items(
            Joi.object({
                inventoryId: Joi.number().integer().positive().required()
                    .messages({
                        "number.base": "El ID del material debe ser un número",
                        "number.positive": "El ID del material debe ser positivo",
                        "any.required": "El ID del material es obligatorio",
                    }),
                quantityUsed: Joi.number().positive().required()
                    .messages({
                        "number.base": "La cantidad debe ser un número",
                        "number.positive": "La cantidad debe ser mayor a 0",
                        "any.required": "La cantidad usada es obligatoria",
                    }),
                notes: Joi.string().allow("").optional()
                    .messages({
                        "string.base": "Las notas deben ser texto",
                    }),
            })
        )
        .min(1)
        .required()
        .messages({
            "array.min": "Debes proporcionar al menos un material",
            "any.required": "Los materiales son obligatorios",
        }),
});
