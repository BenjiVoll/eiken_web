"use strict";
import { Router } from "express";
import {
  isAdminOrManager,
  isAnyUser
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
  convertQuoteToProject,
  replyQuote
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
    isAdminOrManager,
    createBodyValidation(quoteBodyValidation),
    createQuote
  )
  .get("/",
    isAnyUser,
    getQuotes
  )
  .get("/:id",
    isAnyUser,
    getQuote
  )
  .patch("/:id",
    isAdminOrManager,
    createBodyValidation(quoteUpdateValidation),
    updateQuote
  )
  .post("/:id/convert",
    isAdminOrManager,
    convertQuoteToProject
  )
  .post("/:id/reply",
    isAdminOrManager,
    replyQuote
  )
  .delete("/:id",
    isAdminOrManager,
    deleteQuote
  );

export default router;
