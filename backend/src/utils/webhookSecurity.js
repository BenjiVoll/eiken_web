/**
 * Utilidades de seguridad para MercadoPago Webhooks
 */
"use strict";
import crypto from "crypto";

/**
 * Valida la firma de un webhook de MercadoPago
 * Basado en: https://www.mercadopago.com.mx/developers/es/docs/checkout-api/additional-content/security/signatures
 * 
 * @param {Object} req - Request object de Express
 * @param {string} secret - Secret key de MercadoPago (opcional, por defecto usa accessToken)
 * @returns {boolean} - true si la firma es válida
 */
export const validateWebhookSignature = (req, secret = null) => {
    try {
        // Obtener headers de firma
        const xSignature = req.headers['x-signature'];
        const xRequestId = req.headers['x-request-id'];

        if (!xSignature || !xRequestId) {
            console.warn("⚠️  Webhook sin headers de firma (x-signature o x-request-id)");
            return false;
        }

        // El header x-signature viene en formato: "ts=123456,v1=hash"
        const signatureParts = xSignature.split(',');
        const ts = signatureParts.find(part => part.startsWith('ts='))?.split('=')[1];
        const hash = signatureParts.find(part => part.startsWith('v1='))?.split('=')[1];

        if (!ts || !hash) {
            console.warn("⚠️  Firma malformada");
            return false;
        }

        // Verificar que el timestamp no sea muy antiguo (evitar replay attacks)
        const currentTime = Math.floor(Date.now() / 1000);
        const timeDiff = Math.abs(currentTime - parseInt(ts));

        // Rechazar si el webhook tiene más de 5 minutos
        if (timeDiff > 300) {
            console.warn(`⚠️  Webhook muy antiguo: ${timeDiff} segundos`);
            return false;
        }

        // Construir el manifest para verificar
        // Formato: id={data.id}&topic={topic}&ts={timestamp}
        const dataId = req.body?.data?.id || req.query['data.id'];
        const topic = req.body?.type || req.query.type;

        if (!dataId) {
            console.warn("⚠️  Webhook sin data.id");
            return false;
        }

        const manifest = `id=${dataId};request-id=${xRequestId};ts=${ts}`;

        // Si no se provee secret, usamos el access token
        const secretKey = secret || process.env.MERCADOPAGO_ACCESS_TOKEN_TEST;

        if (!secretKey) {
            console.error("❌ No hay secret key configurada para validar firma");
            return false;
        }

        // Calcular HMAC SHA256
        const hmac = crypto.createHmac('sha256', secretKey);
        hmac.update(manifest);
        const calculatedHash = hmac.digest('hex');

        // Comparar hashes
        const isValid = calculatedHash === hash;

        if (!isValid) {
            console.error("❌ Firma inválida");
            console.error(`Expected: ${hash}`);
            console.error(`Calculated: ${calculatedHash}`);
            console.error(`Manifest: ${manifest}`);
        }

        return isValid;

    } catch (error) {
        console.error("❌ Error validando firma de webhook:", error);
        return false;
    }
};

/**
 * Middleware para validar webhook de MercadoPago
 */
export const validateMercadoPagoWebhook = (req, res, next) => {
    // En desarrollo, permitir webhooks sin firma (para testing local)
    if (process.env.NODE_ENV !== 'production' && process.env.SKIP_WEBHOOK_VALIDATION === 'true') {
        console.warn("⚠️  SKIP_WEBHOOK_VALIDATION activado - omitiendo validación de firma");
        return next();
    }

    const isValid = validateWebhookSignature(req);

    if (!isValid) {
        console.error("❌ Webhook rechazado - firma inválida");
        return res.status(401).json({ error: "Unauthorized - Invalid signature" });
    }

    console.log("✅ Firma de webhook validada correctamente");
    next();
};
