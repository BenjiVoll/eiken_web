"use strict";
import { Router } from "express";
import { isAnyUser } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { getDashboardData } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authenticateJwt);

// CU-07: Dashboard accesible para Admin, Gerente, Diseñador y Operador
router.get("/",
    isAnyUser,
    getDashboardData
);

export default router;
