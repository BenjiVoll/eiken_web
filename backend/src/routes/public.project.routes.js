"use strict";
import { Router } from "express";
import { getProjects } from "../controllers/project.controller.js";

const router = Router();

// Ruta pública para obtener todos los proyectos
router.get("/", getProjects);

export default router;
