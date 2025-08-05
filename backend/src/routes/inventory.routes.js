"use strict";
import { Router } from "express";
import {
  isAdminOrManager,
  isAnyUser
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation } from "../middlewares/validations.middleware.js";
import { inventoryBodyValidation } from "../validations/inventory.validation.js";
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
    isAdminOrManager,
    createBodyValidation(inventoryBodyValidation), 
    createInventory
  )
  .get("/", 
    isAnyUser,
    getInventories
  )
  .get("/:id", 
    isAnyUser,
    getInventory
  )
  .patch("/:id", 
    isAdminOrManager,
    createBodyValidation(inventoryBodyValidation), 
    updateInventory
  )
  .delete("/:id", 
    isAdminOrManager,
    deleteInventory
  );

export default router;
