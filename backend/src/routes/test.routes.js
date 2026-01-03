"use strict";
import { Router } from "express";
import { updateOrderStatus } from "../services/order.service.js";
import { handleSuccess, handleErrorServer } from "../handlers/responseHandlers.js";

const router = Router();

/**
 * ENDPOINT DE TESTING: Simula webhook de MercadoPago
 * POST /api/test/simulate-webhook/:orderId
 * 
 * Esto simula lo que haría MercadoPago al enviar un webhook de pago aprobado
 */
router.post("/simulate-webhook/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentStatus = "approved" } = req.body;

        console.log("=== 🧪 SIMULANDO WEBHOOK DE MERCADOPAGO ===");
        console.log(`Orden ID: ${orderId}`);
        console.log(`Payment Status: ${paymentStatus}`);

        // Mapear status como lo haría el webhook real
        let newOrderStatus;

        switch (paymentStatus) {
            case "approved":
                newOrderStatus = "completed";
                break;
            case "rejected":
            case "cancelled":
                newOrderStatus = "cancelled";
                break;
            case "pending":
            case "in_process":
                newOrderStatus = "processing";
                break;
            default:
                newOrderStatus = "processing";
        }

        console.log(`🔄 Actualizando orden ${orderId}: ${paymentStatus} -> ${newOrderStatus}`);

        // Actualizar orden (esto descontará stock si es "completed")
        const order = await updateOrderStatus(parseInt(orderId), newOrderStatus);

        console.log(`✅ Orden ${orderId} actualizada a "${newOrderStatus}"`);
        if (newOrderStatus === "completed") {
            console.log(`📦 Stock descontado automáticamente`);
        }
        console.log("=== 🧪 SIMULACIÓN COMPLETADA ===");

        return handleSuccess(res, 200, "Webhook simulado exitosamente", {
            order,
            simulation: {
                originalPaymentStatus: paymentStatus,
                newOrderStatus: newOrderStatus,
                stockDeducted: newOrderStatus === "completed"
            }
        });

    } catch (error) {
        console.error("❌ Error en simulación de webhook:", error);
        return handleErrorServer(res, 500, error.message);
    }
});

export default router;
