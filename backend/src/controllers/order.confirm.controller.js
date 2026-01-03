"use strict";
import { updateOrderStatus } from "../services/order.service.js";
import { handleSuccess, handleErrorServer } from "../handlers/responseHandlers.js";

/**
 * Confirma una orden (cambia status a completed)
 * POST /api/orders/:id/confirm
 */
export const confirmOrderController = async (req, res) => {
    try {
        const { id } = req.params;

        // Actualizar status a completed (esto descontará el stock automáticamente)
        const order = await updateOrderStatus(parseInt(id), "completed");

        return handleSuccess(res, 200, "Orden confirmada exitosamente", { order });
    } catch (error) {
        console.error("Error confirming order:", error);
        return handleErrorServer(res, 500, error.message || "Error al confirmar la orden");
    }
};
