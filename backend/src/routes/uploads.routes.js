"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrManager } from "../middlewares/authorization.middleware.js";
import { serveQuoteImage, servePublicImage } from "../controllers/uploads.controller.js";

const router = Router();

router.get("/quotes/:filename", authenticateJwt, isAdminOrManager, serveQuoteImage);
router.get("/public/:filename", servePublicImage);

export default router;
