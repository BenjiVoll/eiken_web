"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrManager, isAnyUser } from "../middlewares/authorization.middleware.js";
import { createBodyValidation, createParamsValidation } from "../middlewares/validations.middleware.js";
import { orderBodyValidation } from "../validations/order.validation.js";
import { idParamValidation } from "../validations/common.validation.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByEmail,
  deleteOrder
} from "../controllers/order.controller.js";
import { confirmOrderController } from "../controllers/order.confirm.controller.js";
import {
  registerMaterialsUsage,
  getOrderMaterials,
  deleteMaterialUsage
} from "../controllers/orderInventoryUsage.controller.js";
import { materialUsageValidation } from "../validations/orderInventoryUsage.validation.js";

const router = Router();

// Ruta pública para crear órdenes desde la tienda
router.post("/", sanitizeBody, createBodyValidation(orderBodyValidation), createOrder);

// Ruta pública para confirmar orden después del pago
router.post("/:id/confirm", createParamsValidation(idParamValidation), confirmOrderController);

// Rutas protegidas
router.use(authenticateJwt);

// CU-05 y CU-07: Todos los roles pueden ver órdenes (lectura)
router
  .get("/", isAnyUser, getOrders)
  .get("/email/:email", getOrdersByEmail)
  .get("/:id", createParamsValidation(idParamValidation), getOrderById)
  .patch("/:id/status", isAdminOrManager, createParamsValidation(idParamValidation), updateOrderStatus)
  .delete("/:id", isAdminOrManager, createParamsValidation(idParamValidation), deleteOrder);

// Rutas para registro de materiales usados en órdenes
router
  .post(
    "/:orderId/materials",
    isAdminOrManager,
    createBodyValidation(materialUsageValidation),
    registerMaterialsUsage
  )
  .get("/:orderId/materials", getOrderMaterials)
  .delete("/materials/:usageId", isAdminOrManager, deleteMaterialUsage);

export default router;
