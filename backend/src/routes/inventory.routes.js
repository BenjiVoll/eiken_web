"use strict";
import { Router } from "express";
import { 
  isAdmin, 
  isManagerOrAbove, 
  isDesignerOrAbove 
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation, createQueryValidation } from "../middlewares/validations.middleware.js";
import { inventoryQueryValidation, inventoryBodyValidation } from "../validations/inventory.validation.js";
import {
  createInventory,
  deleteInventory,
  getInventory,
  getInventories,
  updateInventory,
} from "../controllers/inventory.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// Rutas para gestión de inventario
router
  .post("/", 
    isManagerOrAbove, // Solo Manager+ puede crear items de inventario
    createBodyValidation(inventoryBodyValidation), 
    createInventory
  )
  .get("/", 
    isDesignerOrAbove, // Designer+ puede ver lista de inventario
    getInventories
  )
  .get("/:id", 
    isDesignerOrAbove, // Designer+ puede ver detalles de inventario
    getInventory
  )
  .patch("/:id", 
    isDesignerOrAbove, // Designer+ puede actualizar inventario (para uso en proyectos)
    createBodyValidation(inventoryBodyValidation), 
    updateInventory
  )
  .delete("/:id", 
    isManagerOrAbove, // Solo Manager+ puede eliminar items de inventario
    deleteInventory
  );

export default router;
