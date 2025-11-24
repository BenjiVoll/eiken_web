"use strict";
import { Router } from "express";
import { isAdminOrManager } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { getDashboardData } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/",
    isAdminOrManager,
    getDashboardData
);

export default router;
