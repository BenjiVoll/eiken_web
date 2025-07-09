"use strict";
import { Router } from "express";
import { 
  isAdmin, 
  isManagerOrAbove 
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation, createQueryValidation } from "../middlewares/validations.middleware.js";
import { supplierQueryValidation, supplierBodyValidation } from "../validations/supplier.validation.js";
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  getSuppliers,
  updateSupplier,
} from "../controllers/supplier.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// Rutas para gestión de proveedores
router
  .post("/", 
    isManagerOrAbove, // Solo Manager+ puede crear proveedores
    createBodyValidation(supplierBodyValidation), 
    createSupplier
  )
  .get("/", 
    isManagerOrAbove, // Solo Manager+ puede ver lista de proveedores
    getSuppliers
  )
  .get("/:id", 
    isManagerOrAbove, // Solo Manager+ puede ver detalles de proveedor
    getSupplier
  )
  .patch("/:id", 
    isManagerOrAbove, // Solo Manager+ puede actualizar proveedores
    createBodyValidation(supplierBodyValidation), 
    updateSupplier
  )
  .delete("/:id", 
    isAdmin, // Solo Admin puede eliminar proveedores
    deleteSupplier
  );

export default router;
