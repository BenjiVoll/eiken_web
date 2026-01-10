"use strict";
import { Router } from "express";
import {
  isAdminOrManager,
  isAnyUser
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation, createParamsValidation } from "../middlewares/validations.middleware.js";
import { quoteBodyValidation, quoteUpdateValidation } from "../validations/quote.validation.js";
import { idParamValidation } from "../validations/common.validation.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
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
  sanitizeBody,
  createBodyValidation(quoteBodyValidation),
  createQuote
);

// Ruta pública para subir imágenes de referencia
router.post("/:id/images",
  createParamsValidation(idParamValidation),
  upload.array("images", 5),
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
    createParamsValidation(idParamValidation),
    getQuote
  )
  .patch("/:id",
    isAdminOrManager,
    createParamsValidation(idParamValidation),
    sanitizeBody,
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
    createParamsValidation(idParamValidation),
    deleteQuote
  )
  .delete("/:id/images/:filename",
    isAdminOrManager,
    deleteQuoteImage
  );

export default router;
