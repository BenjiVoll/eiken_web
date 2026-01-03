"use strict";
import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/storeSettings.controller.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import passport from "passport";

const router = Router();

// Público: Obtener configuración (para el Checkout)
router.get("/", getSettings);

// Privado (Admin): Actualizar configuración
router.put("/", [
    passport.authenticate("jwt", { session: false }),
    isAdmin
], updateSettings);

export default router;
