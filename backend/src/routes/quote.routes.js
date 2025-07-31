"use strict";
import { Router } from "express";
import { 
  isAdmin,
  isManagerOrAbove,
  isDesignerOrAbove
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation } from "../middlewares/validations.middleware.js";
import { quoteBodyValidation, quoteUpdateValidation } from "../validations/quote.validation.js";
import {
  createQuote,
  deleteQuote,
  getQuote,
  getQuotes,
  updateQuote,
} from "../controllers/quote.controller.js";

const router = Router();

// Ruta pública para crear cotizaciones (para clientes)
router.post("/public", 
  createBodyValidation(quoteBodyValidation), 
  createQuote
);

// Todas las demás rutas requieren autenticación
router.use(authenticateJwt);

// Rutas para gestión de cotizaciones
router
  .post("/", 
    isManagerOrAbove, // Solo Manager+ puede crear cotizaciones
    createBodyValidation(quoteBodyValidation), 
    createQuote
  )
  .get("/", 
    isDesignerOrAbove, // Designer+ puede ver lista de cotizaciones
    getQuotes
  )
  .get("/:id", 
    isDesignerOrAbove, // Designer+ puede ver detalles de cotización
    getQuote
  )
  .patch("/:id", 
    isManagerOrAbove, // Solo Manager+ puede actualizar cotizaciones
    createBodyValidation(quoteUpdateValidation), 
    updateQuote
  )
  .delete("/:id", 
    isAdmin, // Solo Admin puede eliminar cotizaciones
    deleteQuote
  );

export default router;
