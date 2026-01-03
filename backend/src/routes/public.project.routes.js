"use strict";
import { Router } from "express";
import { getProjects, getProjectsByStatus, getFeaturedProjects } from "../controllers/project.controller.js";

const router = Router();

// Ruta pública para obtener todos los proyectos
router.get("/", getProjects);

// Ruta pública para obtener proyectos por status
router.get("/status/:status", getProjectsByStatus);

// Ruta pública para obtener proyectos destacados (portafolio)
router.get("/portfolio", getFeaturedProjects);

export default router;
