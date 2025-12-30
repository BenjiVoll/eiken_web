"use strict";
import { Payment, MercadoPagoConfig } from "mercadopago";
import { updateOrderStatus } from "../services/order.service.js";
import {
    MERCADOPAGO_ACCESS_TOKEN_TEST,
    MERCADOPAGO_ACCESS_TOKEN_PROD
} from "../config/configEnv.js";

/**
 * Webhook para recibir notificaciones de MercadoPago
 * POST /api/webhooks/mercadopago
 */
export const mercadoPagoWebhook = async (req, res) => {
    try {
        console.log("=== MERCADOPAGO WEBHOOK RECEIVED ===");
        console.log("Headers:", req.headers);
        console.log("Body:", req.body);
        console.log("Query:", req.query);

        // MercadoPago puede enviar datos en body o query params
        const { type, data, action } = req.body || {};
        const queryDataId = req.query['data.id'];
        const queryType = req.query.type;

        // Si no hay datos, ignorar
        if (!type && !queryType && !queryDataId) {
            console.log("⚠️ Webhook sin datos - probablemente un test");
            return res.status(200).send("OK");
        }

        // MercadoPago envía diferentes tipos de notificaciones
        // Solo procesamos notificaciones de pago
        if (type !== "payment") {
            console.log(`ℹ️ Webhook type "${type}" ignorado (solo procesamos "payment")`);
            return res.status(200).send("OK");
        }

        // Obtener el ID del pago
        const paymentId = data?.id;

        if (!paymentId) {
            console.warn("⚠️ Webhook sin payment ID");
            return res.status(200).send("OK");
        }

        console.log(`📋 Procesando pago ID: ${paymentId}`);

        // Configurar cliente de MercadoPago
        const isProduction = process.env.NODE_ENV === "production";
        const accessToken = isProduction
            ? MERCADOPAGO_ACCESS_TOKEN_PROD
            : MERCADOPAGO_ACCESS_TOKEN_TEST;

        if (!accessToken) {
            throw new Error("Access token de MercadoPago no configurado");
        }

        const client = new MercadoPagoConfig({ accessToken });
        const payment = new Payment(client);

        // Obtener detalles del pago desde MercadoPago
        const paymentInfo = await payment.get({ id: paymentId });

        console.log("💳 Payment Info:", {
            id: paymentInfo.id,
            status: paymentInfo.status,
            external_reference: paymentInfo.external_reference,
            transaction_amount: paymentInfo.transaction_amount
        });

        const orderId = paymentInfo.external_reference; // ID de nuestra orden
        const paymentStatus = paymentInfo.status;

        if (!orderId) {
            console.warn("⚠️ Payment sin external_reference (orden ID)");
            return res.status(200).send("OK");
        }

        // Mapear status de MercadoPago a status de orden
        let newOrderStatus;

        switch (paymentStatus) {
            case "approved":
                newOrderStatus = "completed"; // Esto descontará stock automáticamente
                break;
            case "rejected":
            case "cancelled":
                newOrderStatus = "cancelled";
                break;
            case "pending":
            case "in_process":
            case "in_mediation":
                newOrderStatus = "processing";
                break;
            case "charged_back":
            case "refunded":
                newOrderStatus = "cancelled";
                break;
            default:
                console.warn(`⚠️ Payment status desconocido: ${paymentStatus}`);
                return res.status(200).send("OK");
        }

        console.log(`🔄 Actualizando orden ${orderId}: ${paymentStatus} -> ${newOrderStatus}`);

        // Actualizar orden (esto descontará stock si es "completed")
        try {
            await updateOrderStatus(parseInt(orderId), newOrderStatus);
            console.log(`✅ Orden ${orderId} actualizada exitosamente a "${newOrderStatus}"`);

            // Si el pago fue aprobado, el stock ya fue descontado por updateOrderStatus
            if (newOrderStatus === "completed") {
                console.log(`📦 Stock descontado para orden ${orderId}`);
            }
        } catch (updateError) {
            console.error(`❌ Error actualizando orden ${orderId}:`, updateError.message);
            // No lanzamos el error para que MP no reintente
        }

        console.log("=== WEBHOOK PROCESADO ===");

        // IMPORTANTE: Siempre responder 200 OK a MercadoPago
        // Si no, MP reintentará enviar el webhook múltiples veces
        return res.status(200).send("OK");

    } catch (error) {
        console.error("❌ Error en webhook de MercadoPago:", error);

        // Aún así responder 200 para evitar reintentos de MP
        return res.status(200).send("ERROR");
    }
};
