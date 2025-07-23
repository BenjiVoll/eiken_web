"use strict";
import { Router } from "express";
import {
  getServices,
  getActiveServicesController,
  getServicesByDivisionController,
  getServicesByCategoryController,
  getService
} from "../controllers/service.controller.js";

const router = Router();

// Rutas públicas para servicios (sin autenticación)
router
  .get("/", getServices) // Obtener todos los servicios
  .get("/active", getActiveServicesController) // Obtener servicios activos
  .get("/division/:division", getServicesByDivisionController) // Servicios por división
  .get("/category/:category", getServicesByCategoryController) // Servicios por categoría
  .get("/:id", getService); // Obtener servicio por ID

export default router;
