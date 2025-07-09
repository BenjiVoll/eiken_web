"use strict";
import { handleErrorClient } from "../handlers/responseHandlers.js";

export function createBodyValidation(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return handleErrorClient(
        res,
        400,
        "Errores de validación en el cuerpo de la petición",
        errors
      );
    }
    
    next();
  };
}

export function createQueryValidation(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return handleErrorClient(
        res,
        400,
        "Errores de validación en los parámetros de consulta",
        errors
      );
    }
    
    next();
  };
}

export function createParamsValidation(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return handleErrorClient(
        res,
        400,
        "Errores de validación en los parámetros de la URL",
        errors
      );
    }
    
    next();
  };
}
