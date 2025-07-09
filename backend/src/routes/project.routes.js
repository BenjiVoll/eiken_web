"use strict";
import { Router } from "express";
import { 
  isAdmin, 
  isManagerOrAbove, 
  isDesignerOrAbove 
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation } from "../middlewares/validations.middleware.js";
import { projectBodyValidation } from "../validations/project.validation.js";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from "../controllers/project.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// Rutas para gestión de proyectos
router
  .post("/", 
    isDesignerOrAbove, // Designer+ puede crear proyectos
    createBodyValidation(projectBodyValidation), 
    createProject
  )
  .get("/", 
    isDesignerOrAbove, // Designer+ puede ver lista de proyectos
    getProjects
  )
  .get("/:id", 
    isDesignerOrAbove, // Designer+ puede ver detalles de proyecto
    getProject
  )
  .patch("/:id", 
    isDesignerOrAbove, // Designer+ puede actualizar proyectos
    createBodyValidation(projectBodyValidation), 
    updateProject
  )
  .delete("/:id", 
    isManagerOrAbove, // Solo Manager+ puede eliminar proyectos
    deleteProject
  );

export default router;
