"use strict";
import { sanitizeObject } from '../helpers/sanitize.helper.js';

/**
 * Middleware para sanitizar el body de las peticiones
 * Previene ataques XSS eliminando código HTML/JS malicioso
 * 
 * Este middleware debe aplicarse DESPUÉS de las validaciones de Joi
 * para no interferir con los mensajes de error
 */
export function sanitizeBody(req, res, next) {
    if (req.body && Object.keys(req.body).length > 0) {
        req.body = sanitizeObject(req.body);
    }
    next();
}

/**
 * Middleware para sanitizar query params
 */
export function sanitizeQuery(req, res, next) {
    if (req.query && Object.keys(req.query).length > 0) {
        req.query = sanitizeObject(req.query);
    }
    next();
}

/**
 * Middleware para sanitizar params
 */
export function sanitizeParams(req, res, next) {
    if (req.params && Object.keys(req.params).length > 0) {
        req.params = sanitizeObject(req.params);
    }
    next();
}
