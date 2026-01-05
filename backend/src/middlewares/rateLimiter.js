"use strict";
import rateLimit from 'express-rate-limit';


// Previene ataques de fuerza bruta en login/register

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: {
        error: "Demasiados intentos de autenticación. Por favor, intenta de nuevo en 15 minutos."
    },
    standardHeaders: true,
    legacyHeaders: false,
});


export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: {
        error: "Demasiadas peticiones desde esta IP. Por favor, intenta más tarde."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const strictLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: {
        error: "Límite de peticiones alcanzado. Espera 5 minutos antes de continuar."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
