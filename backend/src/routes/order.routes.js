"use strict";
import { Router } from "express";
import { 
  isAdmin, 
  isManagerOrAbove 
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation, createQueryValidation } from "../middlewares/validations.middleware.js";
import { orderQueryValidation, orderBodyValidation } from "../validations/order.validation.js";
import {
  createOrder,
  deleteOrder,
  getOrder,
  getOrders,
  updateOrder,
} from "../controllers/order.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// Rutas para gestión de órdenes de compra
router
  .post("/", 
    isManagerOrAbove,
    createBodyValidation(orderBodyValidation), 
    createOrder
  )
  .get("/", 
    isManagerOrAbove,
    createQueryValidation(orderQueryValidation), 
    getOrders
  )
  .get("/:id", 
    isManagerOrAbove,
    createQueryValidation(orderQueryValidation), 
    getOrder
  )
  .patch("/:id", 
    isManagerOrAbove,
    createBodyValidation(orderBodyValidation), 
    updateOrder
  )
  .delete("/:id", 
    isAdmin,
    deleteOrder
  );

export default router;
