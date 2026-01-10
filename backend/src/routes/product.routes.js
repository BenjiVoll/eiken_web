"use strict";
import { Router } from "express";
import {
    isAdmin,
    isAnyUser
} from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { createBodyValidation, createParamsValidation } from "../middlewares/validations.middleware.js";
import { productBodyValidation, productUpdateValidation } from "../validations/product.validation.js";
import { idParamValidation } from "../validations/common.validation.js";
import upload from "../helpers/multer.helper.js";
import {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    updateProduct,
    uploadProductImage,
    deleteProductImage,
    getActiveProducts
} from "../controllers/product.controller.js";
import {
    addMaterialController,
    getProductMaterialsController,
    updateMaterialController,
    removeMaterialController
} from "../controllers/productMaterial.controller.js";

const router = Router();

// Rutas públicas (si se requiere ver productos sin login, por ahora asumimos que la tienda es pública)
// Pero el requerimiento dice "Tienda online", así que debería ser pública.
// Vamos a exponer getActiveProducts públicamente en otra ruta o aquí sin auth?
// Mejor crear un public.product.routes.js o dejarlo abierto aquí.
// Por ahora, dejaremos las rutas de gestión protegidas.

router.use(authenticateJwt);

router
    .post("/",
        isAdmin,
        createBodyValidation(productBodyValidation),
        createProduct
    )
    .get("/",
        isAnyUser,
        getProducts
    )
    .get("/active",
        isAnyUser,
        getActiveProducts
    )
    .get("/:id",
        isAnyUser,
        createParamsValidation(idParamValidation),
        getProduct
    )
    .patch("/:id",
        isAdmin,
        createParamsValidation(idParamValidation),
        createBodyValidation(productUpdateValidation),
        updateProduct
    )
    .delete("/:id",
        isAdmin,
        createParamsValidation(idParamValidation),
        deleteProduct
    )
    .post("/:id/image",
        isAdmin,
        createParamsValidation(idParamValidation),
        upload.single("image"),
        uploadProductImage
    )
    .delete("/:id/image",
        isAdmin,
        createParamsValidation(idParamValidation),
        deleteProductImage
    )
    // Rutas para materiales de productos
    .post("/:productId/materials",
        isAdmin,
        addMaterialController
    )
    .get("/:productId/materials",
        isAnyUser,
        getProductMaterialsController
    )
    .put("/materials/:materialId",
        isAdmin,
        updateMaterialController
    )
    .delete("/materials/:materialId",
        isAdmin,
        removeMaterialController
    );

export default router;
