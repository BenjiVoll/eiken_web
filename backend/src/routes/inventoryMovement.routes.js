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
  createInventoryMovement,
  deleteInventoryMovement,
  getInventoryMovement,
  getInventoryMovements,
  updateInventoryMovement,
} from "../controllers/inventoryMovement.controller.js";

const router = Router();

router.use(authenticateJwt);

// Rutas para gestión de movimientos de inventario
router
  .post("/", 
    isDesignerOrAbove,
    createBodyValidation(inventoryMovementBodyValidation),
    createInventoryMovement
  )
  .get("/", 
    isDesignerOrAbove,
    createQueryValidation(inventoryMovementQueryValidation),
    getInventoryMovements
  )
  .get("/:id", 
    isDesignerOrAbove,
    createQueryValidation(inventoryMovementQueryValidation),
    getInventoryMovement
  )
  .patch("/:id", 
    isManagerOrAbove, 
    createBodyValidation(inventoryMovementBodyValidation),
    updateInventoryMovement
  )
  .delete("/:id", 
    isAdmin,
    deleteInventoryMovement
  );

export default router;
