"use strict";
import { MercadoPagoConfig, Preference } from "mercadopago";
import {
    MERCADOPAGO_ACCESS_TOKEN_TEST,
    MERCADOPAGO_ACCESS_TOKEN_PROD
} from "../config/configEnv.js";

// Configurar cliente de Mercado Pago
const getAccessToken = () => {
    const isProduction = process.env.NODE_ENV === "production";
    const token = isProduction
        ? MERCADOPAGO_ACCESS_TOKEN_PROD
        : MERCADOPAGO_ACCESS_TOKEN_TEST;

    if (!token) {
        throw new Error(
            `Token de Mercado Pago no configurado. Verifica las variables de entorno: ${isProduction ? "MERCADOPAGO_ACCESS_TOKEN_PROD" : "MERCADOPAGO_ACCESS_TOKEN_TEST"
            }`
        );
    }

    return token;
};

let client;
let preference;

// Función para inicializar Mercado Pago (lazy initialization)
const initializeMercadoPago = () => {
    if (client && preference) {
        return; // Ya está inicializado
    }

    try {
        const token = getAccessToken();

        client = new MercadoPagoConfig({
            accessToken: token,
            options: {
                timeout: 5000,
                idempotencyKey: "abc",
            },
        });

        preference = new Preference(client);
    } catch (error) {
        console.error("Error inicializando Mercado Pago:", error.message);
        throw error; // Lanzamos el error para que se maneje arriba
    }
};

/**
 * Crea una preferencia de pago en Mercado Pago
 * @param {Object} orderData - Datos de la orden
 * @param {number} orderData.totalAmount - Monto total
 * @param {string} orderData.orderId - ID de la orden
 * @param {string} orderData.clientName - Nombre del cliente
 * @param {string} orderData.clientEmail - Email del cliente
 * @param {Array} orderData.items - Items de la orden
 * @param {string} orderData.backUrl - URL de retorno después del pago
 * @returns {Promise<Object>} Preferencia creada
 */
export const createPaymentPreference = async (orderData) => {
    try {
        // Inicializar Mercado Pago si no está inicializado
        try {
            initializeMercadoPago();
        } catch (initError) {
            // Si falla la inicialización, lanzar error descriptivo
            if (initError.message?.includes("Cannot find package")) {
                throw new Error(
                    "El paquete 'mercadopago' no está instalado. Ejecuta: npm install mercadopago"
                );
            } else if (initError.message?.includes("Token de Mercado Pago no configurado")) {
                throw new Error(
                    "Token de Mercado Pago no configurado. Agrega MERCADOPAGO_ACCESS_TOKEN_TEST o MERCADOPAGO_ACCESS_TOKEN_PROD en tu archivo .env"
                );
            }
            throw initError;
        }

        const { totalAmount, orderId, clientName, clientEmail, items, backUrl } = orderData;

        // Validar que backUrl esté definido
        if (!backUrl || typeof backUrl !== 'string' || backUrl.trim() === '') {
            throw new Error("backUrl no está definido o es inválido. Verifica FRONTEND_URL en las variables de entorno");
        }

        // Construir items para Mercado Pago
        const preferenceItems = items.map((item) => ({
            id: String(item.productId || item.serviceId || `item-${Date.now()}`),
            title: item.name || "Producto",
            description: item.description || "",
            quantity: parseInt(item.quantity || 1),
            unit_price: Math.round(parseFloat(item.unitPrice || item.price || 0)), // Ensure integer for CLP
            currency_id: "CLP",
        }));

        // Validar que haya items
        if (!preferenceItems || preferenceItems.length === 0) {
            throw new Error("No hay items para procesar");
        }

        // Asegurar que backUrl no termine con / y esté limpio
        const cleanBackUrl = backUrl.trim().replace(/\/$/, "");

        // Construir URLs de retorno
        const successUrl = `${cleanBackUrl}/payment/success`;
        const failureUrl = `${cleanBackUrl}/payment/failure`;
        const pendingUrl = `${cleanBackUrl}/payment/pending`;

        // Validar que las URLs sean válidas
        if (!successUrl || !failureUrl) {
            throw new Error("No se pudieron construir las URLs de retorno");
        }

        // Configurar preferencia
        const preferenceData = {
            items: preferenceItems,
            // CRITICAL: payer.email MUST match the email used to login to MP
            // For sandbox: use test buyer email
            // For production: need to ask user for their MP email
            payer: {
                email: "test_user_4098001220088528592@testuser.com", // HARDCODED for sandbox testing
            },
            back_urls: {
                success: successUrl,
                failure: failureUrl,
                pending: pendingUrl,
            },
            external_reference: String(orderId), // Para identificar la orden después del pago
        };

        // Conditionally enable auto_return only for non-localhost URLs
        // Mercado Pago errors if auto_return is set but back_urls are localhost
        const isLocalhost = backUrl.includes("localhost") || backUrl.includes("127.0.0.1");
        if (!isLocalhost) {
            preferenceData.auto_return = "approved";
        }

        // Validar que las URLs estén correctamente formateadas
        if (!preferenceData.back_urls.success || !preferenceData.back_urls.failure) {
            throw new Error(`Las URLs de retorno no están correctamente configuradas. Success: ${preferenceData.back_urls.success}, Failure: ${preferenceData.back_urls.failure}`);
        }

        // Validar formato de URLs
        try {
            new URL(preferenceData.back_urls.success);
            new URL(preferenceData.back_urls.failure);
            new URL(preferenceData.back_urls.pending);
        } catch (urlError) {
            throw new Error(`URLs de retorno inválidas: ${urlError.message}`);
        }

        const response = await preference.create({ body: preferenceData });

        return {
            id: response.id,
            init_point: response.init_point, // URL para redirigir al usuario
            sandbox_init_point: response.sandbox_init_point, // URL para modo test
            preference_id: response.id,
        };
    } catch (error) {
        console.error("Error creating Mercado Pago preference:", error);
        throw new Error(`Error al crear preferencia de pago: ${error.message}`);
    }
};

/**
 * Obtiene información de un pago
 * @param {string} paymentId - ID del pago
 * @returns {Promise<Object>} Información del pago
 */
export const getPaymentInfo = async (paymentId) => {
    try {
        // Nota: Necesitarías importar Payment de mercadopago para esto
        // Por ahora retornamos null, puedes implementarlo después
        return null;
    } catch (error) {
        console.error("Error getting payment info:", error);
        throw new Error(`Error al obtener información del pago: ${error.message}`);
    }
};

/**
 * Valida la firma de un webhook de Mercado Pago
 * @param {Object} data - Datos del webhook
 * @param {string} signature - Firma del webhook
 * @returns {boolean} True si la firma es válida
 */
export const validateWebhookSignature = (data, signature) => {
    // Implementar validación de firma si es necesario
    // Por ahora retornamos true, pero en producción deberías validar
    return true;
};
