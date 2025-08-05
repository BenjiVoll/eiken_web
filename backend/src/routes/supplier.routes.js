"use strict";
import { Router } from "express";
import {
  isAdminOrManager,
  isAnyUser
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
    isAdminOrManager,
    createBodyValidation(supplierBodyValidation), 
    createSupplier
  )
  .get("/", 
    isAnyUser,
    getSuppliers
  )
  .get("/:id", 
    isAnyUser,
    getSupplier
  )
  .patch("/:id", 
    isAdminOrManager,
    createBodyValidation(supplierBodyValidation), 
    updateSupplier
  )
  .delete("/:id", 
    isAdminOrManager,
    deleteSupplier
  );

export default router;
