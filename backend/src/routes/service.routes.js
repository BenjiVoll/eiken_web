"use strict";
import { Router } from "express";
import { 
  isAdmin, 
  isManagerOrAbove, 
  isDesignerOrAbove 
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation, createQueryValidation } from "../middlewares/validations.middleware.js";
import { serviceQueryValidation, serviceBodyValidation } from "../validations/service.validation.js";
import {
  createService,
  deleteService,
  getService,
  getServices,
  updateService,
} from "../controllers/service.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// Rutas para gestión de servicios
router
  .post("/", 
    isManagerOrAbove, // Solo Manager+ puede crear servicios
    createBodyValidation(serviceBodyValidation), 
    createService
  )
  .get("/", 
    isDesignerOrAbove, // Designer+ puede ver lista de servicios
    getServices
  )
  .get("/:id", 
    isDesignerOrAbove, // Designer+ puede ver detalles de servicios
    getService
  )
  .patch("/:id", 
    isManagerOrAbove, // Solo Manager+ puede actualizar servicios
    createBodyValidation(serviceBodyValidation), 
    updateService
  )
  .delete("/:id", 
    isAdmin, // Solo Admin puede eliminar servicios
    deleteService
  );

export default router;
