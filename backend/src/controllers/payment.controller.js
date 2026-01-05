"use strict";
import { createPaymentPreference, getPaymentInfo } from "../services/mercadopago.service.js";
import { createOrder } from "../services/order.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import { FRONTEND_URL } from "../config/configEnv.js";


// Crea una preferencia de pago y orden

export const createPaymentPreferenceController = async (req, res) => {
    try {
        const { clientName, clientEmail, items, notes } = req.body;

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

        let frontendUrl = FRONTEND_URL || process.env.FRONTEND_URL || "http://localhost:5173";

        if (!frontendUrl || typeof frontendUrl !== 'string') {
            throw new Error("FRONTEND_URL no está configurada correctamente en las variables de entorno");
        }

        frontendUrl = frontendUrl.trim().replace(/\/$/, "");

        if (!frontendUrl || frontendUrl === '') {
            throw new Error("FRONTEND_URL está vacía después de limpiar. Verifica tu archivo .env");
        }

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

        const initPoint = preference.sandbox_init_point;

        if (!initPoint) {
            const fallback = preference.init_point;
            if (!fallback) throw new Error("No URL returned from Mercado Pago");
            return handleSuccess(res, 201, "Preferencia de pago creada", {
                id: preference.id,
                init_point: fallback,
                preference_id: preference.id,
            });
        }

        return handleSuccess(res, 201, "Preferencia de pago creada", {
            preferenceId: preference.id,
            initPoint: initPoint,
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


//Webhook para recibir notificaciones de Mercado Pago

export const paymentWebhookController = async (req, res) => {
    try {
        const { type, data } = req.body;

        if (type === "payment") {
            const paymentId = data.id;

            console.log(`Payment notification received: ${paymentId}`);

            const payment = await getPaymentInfo(paymentId);

            if (payment && payment.status === 'approved') {
                const orderId = payment.external_reference;
                if (orderId) {
                    console.log(`✅ Payment approved for Order #${orderId}. Updating status...`);

                    try {
                        const { updateOrderStatus } = await import("../services/order.service.js");
                        await updateOrderStatus(orderId, "completed");

                        console.log(`🚀 Order #${orderId} marked as COMPLETED and stock updated.`);


                    } catch (orderError) {
                        if (orderError.message === "Orden no encontrada") {
                            console.warn(`⚠️ Webhook Warning: Order #${orderId} not found in database. Skipping update.`);
                        } else {
                            console.error(`❌ Error updating order #${orderId}:`, orderError.message);
                        }
                    }
                } else {
                    console.warn(`⚠️ Payment ${paymentId} approved but no external_reference (Order ID) found.`);
                }
            } else {
                console.log(`ℹ️ Payment ${paymentId} status is: ${payment?.status}`);
            }
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        if (error.status === 404 || error.message?.includes("not found") || error.message?.includes("Payment not found")) {
            console.warn(`⚠️ Webhook Warning: Payment ID not found in MercadoPago (likely old Sandbox event).`);
        } else {
            console.error("Error processing webhook:", error);
        }
        return res.status(200).json({ received: true, error: error.message });
    }
};


// Obtiene el estado de un pago

export const getPaymentStatusController = async (req, res) => {
    try {
        const { paymentId } = req.params;

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
