"use strict";
import { Payment, MercadoPagoConfig } from "mercadopago";
import { updateOrderStatus, getOrderById } from "../services/order.service.js";
import { validateWebhookSignature } from "../utils/webhookSecurity.js";
import {
    MERCADOPAGO_ACCESS_TOKEN_TEST,
    MERCADOPAGO_ACCESS_TOKEN_PROD
} from "../config/configEnv.js";
import { AppDataSource } from "../config/configDb.js";

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

        // 🔒 VALIDACIÓN DE FIRMA (Seguridad)
        // En producción, siempre validar
        if (process.env.NODE_ENV === 'production' || process.env.VALIDATE_WEBHOOK_SIGNATURE === 'true') {
            const isValid = validateWebhookSignature(req);
            if (!isValid) {
                console.error("❌ FIRMA INVÁLIDA - Posible ataque o webhook corrupto");
                return res.status(401).json({ error: "Unauthorized" });
            }
            console.log("✅ Firma validada correctamente");
        } else {
            console.warn("⚠️  Validación de firma desactivada (modo desarrollo)");
        }

        // MercadoPago puede enviar datos en body o query params
        const { type, data, action } = req.body || {};
        const queryDataId = req.query['data.id'];
        const queryType = req.query.type;

        // Si no hay datos, ignorar
        if (!type && !queryType && !queryDataId) {
            console.log("⚠️  Webhook sin datos - probablemente un test");
            return res.status(200).send("OK");
        }

        // MercadoPago envía diferentes tipos de notificaciones
        // Solo procesamos notificaciones de pago
        if (type !== "payment") {
            console.log(`ℹ️  Webhook type "${type}" ignorado (solo procesamos "payment")`);
            return res.status(200).send("OK");
        }

        // Obtener el ID del pago
        const paymentId = data?.id || queryDataId;

        if (!paymentId) {
            console.warn("⚠️  Webhook sin payment ID");
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
            console.warn("⚠️  Payment sin external_reference (orden ID)");
            return res.status(200).send("OK");
        }

        // 🔄 IDEMPOTENCIA: Verificar si ya procesamos este pago
        const order = await getOrderById(parseInt(orderId));

        if (!order) {
            console.error(`❌ Orden ${orderId} no encontrada`);
            return res.status(200).send("ORDER_NOT_FOUND");
        }

        if (order.lastProcessedPaymentId === paymentId.toString()) {
            console.log(`✅ Payment ${paymentId} ya procesado anteriormente para orden ${orderId}`);
            return res.status(200).send("ALREADY_PROCESSED");
        }

        console.log(`🆕 Nuevo pago detectado - procesando...`);

        // Mapear status de MercadoPago a status de orden
        let newOrderStatus;
        let shouldRestoreStock = false;

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
                newOrderStatus = "refunded";
                shouldRestoreStock = true; // 💰 Devolver stock en reembolsos
                break;
            default:
                console.warn(`⚠️  Payment status desconocido: ${paymentStatus}`);
                return res.status(200).send("OK");
        }

        console.log(`🔄 Actualizando orden ${orderId}: ${paymentStatus} -> ${newOrderStatus}`);

        // Actualizar orden con nuevo status y registrar payment ID
        try {
            // Usar transacción para garantizar atomicidad
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                // Actualizar status de orden
                await updateOrderStatus(parseInt(orderId), newOrderStatus, transactionalEntityManager);

                // Actualizar payment ID para idempotencia
                await transactionalEntityManager.update(
                    "Order",
                    { id: parseInt(orderId) },
                    {
                        lastProcessedPaymentId: paymentId.toString(),
                        paymentId: paymentId.toString()
                    }
                );

                console.log(`✅ Orden ${orderId} actualizada exitosamente a "${newOrderStatus}"`);

                // 💰 Si es reembolso, restaurar stock
                if (shouldRestoreStock && order.status === "completed") {
                    console.log(`🔙 Restaurando stock para reembolso de orden ${orderId}`);
                    await restoreStockForOrder(parseInt(orderId), transactionalEntityManager);
                    console.log(`✅ Stock restaurado para orden ${orderId}`);
                }

                // Si el pago fue aprobado, el stock ya fue descontado por updateOrderStatus
                if (newOrderStatus === "completed") {
                    console.log(`📦 Stock descontado para orden ${orderId}`);
                }
            });

            // TODO: Enviar notificación por email al cliente
            // await sendOrderStatusEmail(orderId, newOrderStatus);

        } catch (updateError) {
            console.error(`❌ Error actualizando orden ${orderId}:`, updateError.message);
            // No lanzamos el error para que MP no reintente
            return res.status(200).send("UPDATE_ERROR");
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

/**
 * Restaura el stock de productos al hacer un reembolso
 * @param {number} orderId - ID de la orden
 * @param {EntityManager} manager - Transaction manager
 */
async function restoreStockForOrder(orderId, manager) {
    try {
        // Obtener items de la orden
        const orderItems = await manager.find("OrderItem", {
            where: { orderId: orderId }
        });

        if (!orderItems || orderItems.length === 0) {
            console.warn(`⚠️  Orden ${orderId} sin items para restaurar stock`);
            return;
        }

        // Restaurar stock de cada producto
        for (const item of orderItems) {
            if (item.productId) {
                await manager.increment(
                    "Product",
                    { id: item.productId },
                    "stock",
                    item.quantity
                );
                console.log(`  ↑ Producto ${item.productId}: +${item.quantity} unidades`);
            }
        }

        console.log(`✅ Stock restaurado para ${orderItems.length} productos`);
    } catch (error) {
        console.error("❌ Error restaurando stock:", error);
        throw error;
    }
}
