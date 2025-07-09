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

router.use(authenticateJwt);

// Rutas para gestión de inventario
router
  .post("/", 
    isManagerOrAbove,
    createBodyValidation(inventoryBodyValidation), 
    createInventory
  )
  .get("/", 
    isDesignerOrAbove,
    getInventories
  )
  .get("/:id", 
    isDesignerOrAbove,
    getInventory
  )
  .patch("/:id", 
    isDesignerOrAbove,
    createBodyValidation(inventoryBodyValidation), 
    updateInventory
  )
  .delete("/:id", 
    isManagerOrAbove,
    deleteInventory
  );

export default router;
