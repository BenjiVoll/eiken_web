"use strict";
import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para rutas de autenticación
 * Previene ataques de fuerza bruta en login/register
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por ventana
    skipSuccessfulRequests: true, // No contar requests exitosos
    message: {
        error: "Demasiados intentos de autenticación. Por favor, intenta de nuevo en 15 minutos."
    },
    standardHeaders: true, // Retornar info de rate limit en headers: `RateLimit-*`
    legacyHeaders: false,  // Deshabilitar headers `X-RateLimit-*`
});

/**
 * Rate limiter general para el API
 * Previene abuso de endpoints
 */
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100, // 100 requests por minuto
    message: {
        error: "Demasiadas peticiones desde esta IP. Por favor, intenta más tarde."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter estricto para operaciones críticas
 * Para endpoints que modifican datos sensibles
 */
export const strictLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10, // 10 requests por ventana
    message: {
        error: "Límite de peticiones alcanzado. Espera 5 minutos antes de continuar."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
