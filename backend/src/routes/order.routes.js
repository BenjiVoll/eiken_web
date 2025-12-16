"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrManager } from "../middlewares/authorization.middleware.js";
import { createBodyValidation } from "../middlewares/validations.middleware.js";
import { orderBodyValidation } from "../validations/order.validation.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByEmail,
  deleteOrder
} from "../controllers/order.controller.js";
import { confirmOrderController } from "../controllers/order.confirm.controller.js";

const router = Router();

// Ruta pública para crear órdenes desde la tienda
router.post("/", createBodyValidation(orderBodyValidation), createOrder);

// Ruta pública para confirmar orden después del pago
router.post("/:id/confirm", confirmOrderController);

// Rutas protegidas
router.use(authenticateJwt);

router
  .get("/", isAdminOrManager, getOrders)
  .get("/email/:email", getOrdersByEmail)
  .get("/:id", getOrderById)
  .patch("/:id/status", isAdminOrManager, updateOrderStatus)
  .delete("/:id", isAdminOrManager, deleteOrder);

export default router;
