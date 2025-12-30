"use strict";
import xss from 'xss';

/**
 * Sanitiza texto eliminando código HTML/JavaScript malicioso
 * Previene ataques XSS (Cross-Site Scripting)
 * 
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeHtml = (text) => {
    if (!text) return text;
    if (typeof text !== 'string') return text;

    return xss(text, {
        whiteList: {}, // No permitir ningún tag HTML
        stripIgnoreTag: true, // Eliminar tags no permitidos
        stripIgnoreTagBody: ['script'], // Eliminar contenido de scripts
    });
};

/**
 * Sanitiza un objeto recursivamente
 * 
 * @param {Object} obj - Objeto a sanitizar
 * @returns {Object} - Objeto sanitizado
 */
export const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            if (typeof value === 'string') {
                sanitized[key] = sanitizeHtml(value);
            } else if (Array.isArray(value)) {
                sanitized[key] = value.map(item =>
                    typeof item === 'string' ? sanitizeHtml(item) : sanitizeObject(item)
                );
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }
    }

    return sanitized;
};
