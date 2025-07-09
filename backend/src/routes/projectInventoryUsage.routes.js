"use strict";
import { Router } from "express";
import { 
  isAdmin, 
  isManagerOrAbove, 
  isDesignerOrAbove 
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation, createQueryValidation } from "../middlewares/validations.middleware.js";
import { projectInventoryUsageQueryValidation, projectInventoryUsageBodyValidation } from "../validations/projectInventoryUsage.validation.js";
import {
  createProjectInventoryUsage,
  deleteProjectInventoryUsage,
  getProjectInventoryUsage,
  getProjectInventoryUsages,
  updateProjectInventoryUsage,
} from "../controllers/projectInventoryUsage.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// Rutas para gestión de uso de materiales en proyectos
router
  .post("/", 
    isDesignerOrAbove, // Designer+ puede registrar uso de materiales
    createBodyValidation(projectInventoryUsageBodyValidation),
    createProjectInventoryUsage
  )
  .get("/", 
    isDesignerOrAbove, // Designer+ puede ver lista de usos de materiales
    createQueryValidation(projectInventoryUsageQueryValidation),
    getProjectInventoryUsages
  )
  .get("/:id", 
    isDesignerOrAbove, // Designer+ puede ver detalles de uso de materiales
    createQueryValidation(projectInventoryUsageQueryValidation),
    getProjectInventoryUsage
  )
  .patch("/:id", 
    isDesignerOrAbove, // Designer+ puede actualizar uso de materiales
    createBodyValidation(projectInventoryUsageBodyValidation),
    updateProjectInventoryUsage
  )
  .delete("/:id", 
    isManagerOrAbove, // Solo Manager+ puede eliminar registros de uso
    deleteProjectInventoryUsage
  );

export default router;
