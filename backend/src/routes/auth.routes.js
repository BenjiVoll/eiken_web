"use strict";
import { Router } from "express";
import { login, logout, register } from "../controllers/auth.controller.js";
import { createBodyValidation } from "../middlewares/validations.middleware.js";
import { authValidation, registerValidation } from "../validations/auth.validation.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router
  .post("/login", authLimiter, createBodyValidation(authValidation), login)
  .post("/register", authLimiter, createBodyValidation(registerValidation), register)
  .post("/logout", logout);

export default router;