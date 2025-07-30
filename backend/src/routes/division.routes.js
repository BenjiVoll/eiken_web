import { Router } from "express";
import {
  getDivisions,
  createDivisionController,
  updateDivisionController,
  deleteDivisionController,
} from "../controllers/division.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isManagerOrAbove } from "../middlewares/authorization.middleware.js";
import { createBodyValidation } from "../middlewares/validations.middleware.js";
import { divisionBodyValidation, divisionUpdateValidation } from "../validations/division.validation.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

router
  .get("/", isManagerOrAbove,getDivisions)
  .post("/", isManagerOrAbove, createBodyValidation(divisionBodyValidation), createDivisionController)
  .put("/:id", isManagerOrAbove, createBodyValidation(divisionUpdateValidation), updateDivisionController)
  .delete("/:id", isManagerOrAbove, deleteDivisionController);

export default router;
