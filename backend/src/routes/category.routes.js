import { Router } from "express";
import {
  getCategories,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/category.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin, isAnyUser } from "../middlewares/authorization.middleware.js";
import { createBodyValidation } from "../middlewares/validations.middleware.js";
import { categoryBodyValidation, categoryUpdateValidation } from "../validations/category.validation.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJwt);

router
  .get("/", isAnyUser, getCategories)
  .post("/", isAdmin, createBodyValidation(categoryBodyValidation), createCategoryController)
  .put("/:id", isAdmin, createBodyValidation(categoryUpdateValidation), updateCategoryController)
  .delete("/:id", isAdmin, deleteCategoryController);

export default router;
