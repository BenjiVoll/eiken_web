import { Router } from "express";
import {
  getDivisions,
  createDivisionController,
  updateDivisionController,
  deleteDivisionController,
} from "../controllers/division.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrManager, isAnyUser } from "../middlewares/authorization.middleware.js";
import { createBodyValidation } from "../middlewares/validations.middleware.js";
import { divisionBodyValidation, divisionUpdateValidation } from "../validations/division.validation.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

router
  .get("/", isAnyUser, getDivisions)
  .post("/", isAdminOrManager, createBodyValidation(divisionBodyValidation), createDivisionController)
  .put("/:id", isAdminOrManager, createBodyValidation(divisionUpdateValidation), updateDivisionController)
  .delete("/:id", isAdminOrManager, deleteDivisionController);

export default router;
