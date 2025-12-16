"use strict";
import { createPaymentPreference } from "../services/mercadopago.service.js";
import { createOrder } from "../services/order.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import { FRONTEND_URL } from "../config/configEnv.js";

/**
 * Crea una preferencia de pago y orden
 * POST /api/payments/create-preference
 */
export const createPaymentPreferenceController = async (req, res) => {
    try {
        const { clientName, clientEmail, items, notes } = req.body;

        // Validar datos requeridos
        if (!clientName || !clientEmail || !items || items.length === 0) {
            return handleErrorClient(
                res,
                400,
                "Datos incompletos",
                "Se requieren clientName, clientEmail e items"
            );
        }

        // Crear la orden primero
        const orderData = {
            clientName,
            clientEmail,
            items,
            notes: notes || "",
        };

        const order = await createOrder(orderData);

        // Obtener URL base del frontend (asegurarse de que no termine con /)
        let frontendUrl = FRONTEND_URL || process.env.FRONTEND_URL || "http://localhost:5173";

        // Validar y limpiar la URL
        if (!frontendUrl || typeof frontendUrl !== 'string') {
            throw new Error("FRONTEND_URL no está configurada correctamente en las variables de entorno");
        }

        frontendUrl = frontendUrl.trim().replace(/\/$/, ""); // Remover espacios y trailing slash

        // Validar que la URL esté definida después de limpiar
        if (!frontendUrl || frontendUrl === '') {
            throw new Error("FRONTEND_URL está vacía después de limpiar. Verifica tu archivo .env");
        }

        // Crear preferencia de pago en Mercado Pago
        const preference = await createPaymentPreference({
            totalAmount: order.totalAmount,
            orderId: order.id,
            clientName,
            clientEmail,
            items: items.map((item) => ({
                productId: item.productId,
                name: item.name || "Producto",
                description: item.description || "",
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                price: item.unitPrice,
            })),
            backUrl: frontendUrl,
        });

        // Strategy: Sandbox URL + No Payer Data + Incognito.
        const initPoint = preference.sandbox_init_point;

        if (!initPoint) {
            // If Sandbox is missing (rare), fall back to init_point
            const fallback = preference.init_point;
            if (!fallback) throw new Error("No URL returned from Mercado Pago");
            return handleSuccess(res, 201, "Preferencia de pago creada", {
                id: preference.id,
                init_point: fallback,
                preference_id: preference.id,
            });
        }

        return handleSuccess(res, 201, "Preferencia de pago creada", {
            preferenceId: preference.id, // ID de la preferencia para el SDK
            initPoint: initPoint, // URL para redirección manual (backup)
            orderId: order.id,
        });
    } catch (error) {
        console.error("Error creating payment preference:", error);

        // Mensaje más descriptivo
        let errorMessage = error.message || "Error al crear preferencia de pago";

        // Mensajes específicos para errores comunes
        if (error.message?.includes("Cannot find package")) {
            errorMessage = "El paquete 'mercadopago' no está instalado. Ejecuta: npm install mercadopago";
        } else if (error.message?.includes("Token de Mercado Pago no configurado")) {
            errorMessage = "Configura las variables de entorno de Mercado Pago en el archivo .env";
        }

        return handleErrorServer(
            res,
            500,
            errorMessage
        );
    }
};

/**
 * Webhook para recibir notificaciones de Mercado Pago
 * POST /api/payments/webhook
 */
export const paymentWebhookController = async (req, res) => {
    try {
        const { type, data } = req.body;

        // Mercado Pago envía diferentes tipos de notificaciones
        if (type === "payment") {
            const paymentId = data.id;

            // Aquí deberías:
            // 1. Consultar el estado del pago en Mercado Pago
            // 2. Actualizar la orden en tu base de datos
            // 3. Enviar email de confirmación si es aprobado

            console.log(`Payment notification received: ${paymentId}`);

            // Por ahora solo confirmamos la recepción
            // TODO: Implementar actualización de orden
        }

        // Siempre responder 200 para que Mercado Pago sepa que recibimos la notificación
        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Error processing webhook:", error);
        // Aún así respondemos 200 para evitar que Mercado Pago reintente
        return res.status(200).json({ received: true, error: error.message });
    }
};

/**
 * Obtiene el estado de un pago
 * GET /api/payments/status/:paymentId
 */
export const getPaymentStatusController = async (req, res) => {
    try {
        const { paymentId } = req.params;

        // TODO: Implementar consulta a Mercado Pago
        // Por ahora retornamos un mensaje
        return handleSuccess(res, 200, "Estado del pago", {
            paymentId,
            status: "pending",
            message: "Consulta de estado no implementada aún",
        });
    } catch (error) {
        console.error("Error getting payment status:", error);
        return handleErrorServer(res, 500, "Error al obtener estado del pago");
    }
};
