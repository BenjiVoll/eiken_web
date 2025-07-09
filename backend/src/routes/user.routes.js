"use strict";
import { Router } from "express";
import { 
  isAdmin, 
  isManagerOrAbove, 
  isOwnerOrManagerAbove 
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation, createQueryValidation } from "../middlewares/validations.middleware.js";
import { userQueryValidation, userBodyValidation } from "../validations/user.validation.js";
import {
  createUserController,
  deleteUserController,
  getUserController,
  getUsersController,
  updateUserController,
} from "../controllers/user.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// Rutas que requieren rol de administrador
router
  .post("/", 
    isAdmin, 
    createBodyValidation(userBodyValidation), 
    createUserController
  ) // Solo admin puede crear usuarios
  .get("/", 
    isManagerOrAbove, 
    getUsersController
  ) // Manager+ puede ver lista de usuarios
  .delete("/:id", 
    isAdmin, 
    deleteUserController
  ); // Solo admin puede eliminar usuarios

// Rutas que permiten acceso a recursos propios o requieren permisos de manager+
router
  .get("/:id", 
    isOwnerOrManagerAbove,
    getUserController
  ) // Puede ver su propio perfil o manager+ puede ver cualquiera
  .patch("/:id", 
    isOwnerOrManagerAbove,
    createBodyValidation(userBodyValidation), 
    updateUserController
  ); // Puede actualizar su propio perfil o manager+ puede actualizar cualquiera

export default router;