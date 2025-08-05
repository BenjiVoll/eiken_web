"use strict";
import { Router } from "express";
import { getProjects, getProjectsByStatus } from "../controllers/project.controller.js";

const router = Router();

// Ruta pública para obtener todos los proyectos
router.get("/", getProjects);

// Ruta pública para obtener proyectos por status
router.get("/status/:status", getProjectsByStatus);

export default router;
