"use strict";
import { Router } from "express";
import { 
  isAdmin
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation } from "../middlewares/validations.middleware.js";
import { userBodyValidation } from "../validations/user.validation.js";
import {
  createUserController,
  deleteUserController,
  getUserController,
  getUsersController,
  updateUserController,
} from "../controllers/user.controller.js";

const router = Router();


// Todas las rutas protegidas requieren autenticación
router.use(authenticateJwt);

// CRUD de usuarios solo para admin
router
  .post("/", 
    isAdmin, 
    createBodyValidation(userBodyValidation), 
    createUserController
  ) // Solo admin puede crear usuarios
  .get("/", 
    isAdmin, 
    getUsersController
  ) // Solo admin puede ver lista de usuarios
  .get("/:id", 
    isAdmin,
    getUserController
  )
  .patch("/:id", 
    isAdmin,
    createBodyValidation(userBodyValidation), 
    updateUserController
  )
  .delete("/:id", 
    isAdmin, 
    deleteUserController
  ); // Solo admin puede eliminar usuarios


export default router;