import { Router } from "express";
import {
  getCategories,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/category.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isManagerOrAbove } from "../middlewares/authorization.middleware.js";
import { createBodyValidation } from "../middlewares/validations.middleware.js";
import { categoryBodyValidation, categoryUpdateValidation } from "../validations/category.validation.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

router
  .get("/", isManagerOrAbove, getCategories)
  .post("/", isManagerOrAbove, createBodyValidation(categoryBodyValidation), createCategoryController)
  .put("/:id", isManagerOrAbove, createBodyValidation(categoryUpdateValidation), updateCategoryController)
  .delete("/:id", isManagerOrAbove, deleteCategoryController);

export default router;
