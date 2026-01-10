"use strict";
import { Router } from "express";
import upload from "../helpers/multer.helper.js";
import {
  isAdminOrManager,
  isAnyUser
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation, createQueryValidation } from "../middlewares/validations.middleware.js";
import { serviceQueryValidation, serviceBodyValidation } from "../validations/service.validation.js";
import { deleteServiceImage } from "../controllers/service.controller.js";
import {
  createService,
  deleteService,
  getService,
  getServices,
  updateService,
  uploadServiceImage
} from "../controllers/service.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

// Rutas para gestión de servicios
router
  .post("/:id/image",
    upload.single("image"),
    uploadServiceImage
  )
  .post("/",
    isAdminOrManager,
    createBodyValidation(serviceBodyValidation),
    createService
  )
  .get("/",
    isAnyUser,
    getServices
  )
  .get("/:id",
    isAnyUser,
    getService
  )
  .patch("/:id",
    isAdminOrManager,
    createBodyValidation(serviceBodyValidation),
    updateService
  )
  .delete("/:id",
    isAdminOrManager,
    deleteService
  )
  .delete("/:id/image",
    isAdminOrManager,
    deleteServiceImage
  );

export default router;
