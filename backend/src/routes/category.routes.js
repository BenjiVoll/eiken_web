import { Router } from "express";
import {
  getCategories,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/category.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrManager, isAnyUser } from "../middlewares/authorization.middleware.js";
import { createBodyValidation } from "../middlewares/validations.middleware.js";
import { categoryBodyValidation, categoryUpdateValidation } from "../validations/category.validation.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

router
  .get("/", isAnyUser, getCategories)
  .post("/", isAdminOrManager, createBodyValidation(categoryBodyValidation), createCategoryController)
  .put("/:id", isAdminOrManager, createBodyValidation(categoryUpdateValidation), updateCategoryController)
  .delete("/:id", isAdminOrManager, deleteCategoryController);

export default router;
