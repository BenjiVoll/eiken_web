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
    isManagerOrAbove, // Solo Manager+ puede crear órdenes
    createBodyValidation(orderBodyValidation), 
    createOrder
  )
  .get("/", 
    isManagerOrAbove, // Solo Manager+ puede ver lista de órdenes
    createQueryValidation(orderQueryValidation), 
    getOrders
  )
  .get("/:id", 
    isManagerOrAbove, // Solo Manager+ puede ver detalles de órdenes
    createQueryValidation(orderQueryValidation), 
    getOrder
  )
  .patch("/:id", 
    isManagerOrAbove, // Solo Manager+ puede actualizar órdenes
    createBodyValidation(orderBodyValidation), 
    updateOrder
  )
  .delete("/:id", 
    isAdmin, // Solo Admin puede eliminar órdenes
    deleteOrder
  );

export default router;
