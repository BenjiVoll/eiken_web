"use strict";
import { Router } from "express";
import { 
  isAdmin,
  isManagerOrAbove,
  isDesignerOrAbove
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation } from "../middlewares/validations.middleware.js";
import { projectBodyValidation, projectUpdateValidation } from "../validations/project.validation.js";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
  uploadProjectImage,
  deleteProjectImage
} from "../controllers/project.controller.js";
import upload from "../helpers/multer.helper.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// Rutas para gestión de proyectos
router
  .post("/", 
    isManagerOrAbove, // Solo Manager+ puede crear proyectos
    createBodyValidation(projectBodyValidation), 
    createProject
  )
  .get("/", 
    isDesignerOrAbove, // Designer+ y operador pueden ver lista de proyectos
    getProjects
  )
  .get("/:id", 
    isDesignerOrAbove, // Designer+ y operador pueden ver detalles de proyecto
    getProject
  )
  .patch("/:id", 
    isManagerOrAbove, // Solo Manager+ puede actualizar proyectos
    createBodyValidation(projectUpdateValidation), 
    updateProject
  )
  .delete("/:id", 
    isAdmin, // Solo Admin puede eliminar proyectos
    deleteProject
  )
  .post("/:id/image",
    isDesignerOrAbove,
    upload.single("image"),
    uploadProjectImage
  );
  router.delete("/:id/image",
  isManagerOrAbove,
  deleteProjectImage
);

export default router;
