"use strict";
import { Router } from "express";
import {
    addMaterialController,
    getProductMaterialsController,
    updateMaterialController,
    removeMaterialController
} from "../controllers/productMaterial.controller.js";
import { authenticationMiddleware } from "../middlewares/authentication.middleware.js";
import { isAdminOrManager } from "../middlewares/authorization.middleware.js";

const router = Router();

// Todas las rutas requieren autenticación de admin/manager
router.use(authenticationMiddleware);
router.use(isAdminOrManager);

// Rutas para materiales de productos
router.post("/:productId/materials", addMaterialController);
router.get("/:productId/materials", getProductMaterialsController);
router.put("/materials/:materialId", updateMaterialController);
router.delete("/materials/:materialId", removeMaterialController);

export default router;
