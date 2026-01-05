"use strict";
import xss from 'xss';

// Sanitiza texto eliminando código HTML/JavaScript malicioso. Previene ataques XSS (Cross-Site Scripting)

export const sanitizeHtml = (text) => {
    if (!text) return text;
    if (typeof text !== 'string') return text;

    return xss(text, {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script'],
    });
};

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
