"use strict";
import { Router } from "express";
import {
  isAdminOrManager,
  isAnyUser,
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
  deleteProjectImage,
  getFeaturedProjects
} from "../controllers/project.controller.js";
import upload from "../helpers/multer.helper.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// Rutas para gestión de proyectos
router
  .post("/",
    isAdminOrManager,
    createBodyValidation(projectBodyValidation),
    createProject
  )
  .get("/",
    isAnyUser,
    getProjects
  )
  .get("/portfolio",
    isAnyUser,
    // TODO: Si es publico, quizás quitar isAnyUser o usar un middleware 'optionalAuth'
    getFeaturedProjects
  )
  .get("/:id",
    isAnyUser,
    getProject
  )
  // CU-04: Admin, Manager y Designer pueden editar proyectos
  .patch("/:id",
    isDesignerOrAbove,
    createBodyValidation(projectUpdateValidation),
    updateProject
  )
  .delete("/:id",
    isAdminOrManager,
    deleteProject
  )
  .post("/:id/image",
    isDesignerOrAbove,
    upload.single("image"),
    uploadProjectImage
  );
router.delete("/:id/image",
  isAdminOrManager,
  deleteProjectImage
);

export default router;
