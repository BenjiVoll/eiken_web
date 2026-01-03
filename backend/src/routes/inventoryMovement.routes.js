"use strict";
import { Router } from "express";
import {
  isAdmin,
  isManagerOrAbove,
  isDesignerOrAbove
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation, createQueryValidation } from "../middlewares/validations.middleware.js";
import { inventoryMovementQueryValidation, inventoryMovementBodyValidation } from "../validations/inventoryMovement.validation.js";
import {
  createInventoryMovementController,
  deleteInventoryMovementController,
  getInventoryMovementByIdController,
  getInventoryMovementsController,
  updateInventoryMovementController,
} from "../controllers/inventoryMovement.controller.js";

const router = Router();

router.use(authenticateJwt);

// Rutas para gestión de movimientos de inventario
router
  .post("/",
    isDesignerOrAbove,
    createBodyValidation(inventoryMovementBodyValidation),
    createInventoryMovementController
  )
  .get("/",
    isDesignerOrAbove,
    createQueryValidation(inventoryMovementQueryValidation),
    getInventoryMovementsController
  )
  .get("/:id",
    isDesignerOrAbove,
    createQueryValidation(inventoryMovementQueryValidation),
    getInventoryMovementByIdController
  )
  .patch("/:id",
    isManagerOrAbove,
    createBodyValidation(inventoryMovementBodyValidation),
    updateInventoryMovementController
  )
  .delete("/:id",
    isAdmin,
    deleteInventoryMovementController
  );

export default router;
