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

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// Rutas para gestión de movimientos de inventario
router
  .post("/", 
    isDesignerOrAbove, // Designer+ puede crear movimientos (para uso en proyectos)
    createBodyValidation(inventoryMovementBodyValidation),
    createInventoryMovement
  )
  .get("/", 
    isDesignerOrAbove, // Designer+ puede ver lista de movimientos
    createQueryValidation(inventoryMovementQueryValidation),
    getInventoryMovements
  )
  .get("/:id", 
    isDesignerOrAbove, // Designer+ puede ver detalles de movimientos
    createQueryValidation(inventoryMovementQueryValidation),
    getInventoryMovement
  )
  .patch("/:id", 
    isManagerOrAbove, // Solo Manager+ puede actualizar movimientos
    createBodyValidation(inventoryMovementBodyValidation),
    updateInventoryMovement
  )
  .delete("/:id", 
    isAdmin, // Solo Admin puede eliminar movimientos
    deleteInventoryMovement
  );

export default router;
