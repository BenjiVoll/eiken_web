"use strict";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
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

// Función para inicializar Mercado Pago
const initializeMercadoPago = () => {
    if (client && preference) {
        return;
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
        throw error;
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

        // Obtener URL del backend para notificaciones
        let notificationUrl;
        if (process.env.BACKEND_URL) {
            const cleanBackendUrl = process.env.BACKEND_URL.trim().replace(/\/$/, "");
            notificationUrl = `${cleanBackendUrl}/api/payments/webhook`;
        }

        const preferenceData = {
            items: preferenceItems,
            // En producción, usar el email real del cliente
            // Si estamos en desarrollo/sandbox, igual podemos usarlo, 
            // pero si falla, se puede hacer fallback a un test user si es estrictamente necesario.
            // Para homologación real, debe ser el email del usuario.
            payer: {
                email: clientEmail,
            },
            back_urls: {
                success: successUrl,
                failure: failureUrl,
                pending: pendingUrl,
            },
            external_reference: String(orderId),
        };

        if (notificationUrl) {
            preferenceData.notification_url = notificationUrl;
        }

        const isLocalhost = backUrl.includes("localhost") || backUrl.includes("127.0.0.1");
        // Solo activar auto_return en producción real
        if (process.env.NODE_ENV === 'production' && !isLocalhost) {
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

        console.log("🚀 [DEBUG] Creating Preference with Data:", JSON.stringify(preferenceData, null, 2));
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

// Obtener información de un pago
export const getPaymentInfo = async (paymentId) => {
    try {
        initializeMercadoPago();
        const payment = new Payment(client);
        return await payment.get({ id: paymentId });
    } catch (error) {
        console.error("Error getting payment info:", error);
        throw new Error(`Error al obtener información del pago: ${error.message}`);
    }
};

// Validar firma de webhook
export const validateWebhookSignature = (data, signature) => {
    // Implementar validación de firma si es necesario
    // Por ahora retornamos true, pero en producción deberías validar
    return true;
};
