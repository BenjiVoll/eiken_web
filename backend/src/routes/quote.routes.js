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
  replyQuote,
  uploadQuoteImages,
  deleteQuoteImage
} from "../controllers/quote.controller.js";
import upload from "../helpers/multer.helper.js";

const router = Router();

// Ruta pública para crear cotizaciones (para clientes)
router.post("/public",
  createBodyValidation(quoteBodyValidation),
  createQuote
);

// Ruta pública para subir imágenes de referencia
router.post("/:id/images",
  upload.array("images", 3),
  uploadQuoteImages
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
  )
  .delete("/:id/images/:filename",
    isAdminOrManager,
    deleteQuoteImage
  );

export default router;
