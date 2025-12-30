"use strict";
import {
    addMaterialToProduct,
    getProductMaterials,
    updateProductMaterial,
    removeMaterialFromProduct
} from "../services/productMaterial.service.js";
import { handleSuccess, handleErrorServer } from "../handlers/responseHandlers.js";

/**
 * Agregar material a producto
 * POST /api/products/:productId/materials
 */
export const addMaterialController = async (req, res) => {
    try {
        const { productId } = req.params;
        const material = await addMaterialToProduct(parseInt(productId), req.body);
        return handleSuccess(res, 201, "Material agregado al producto", { material });
    } catch (error) {
        console.error("Error adding material to product:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

/**
 * Obtener materiales de un producto
 * GET /api/products/:productId/materials
 */
export const getProductMaterialsController = async (req, res) => {
    try {
        const { productId } = req.params;
        const materials = await getProductMaterials(parseInt(productId));
        return handleSuccess(res, 200, "Materiales obtenidos", { materials });
    } catch (error) {
        console.error("Error getting product materials:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

/**
 * Actualizar cantidad de material
 * PUT /api/products/materials/:materialId
 */
export const updateMaterialController = async (req, res) => {
    try {
        const { materialId } = req.params;
        const material = await updateProductMaterial(parseInt(materialId), req.body);
        return handleSuccess(res, 200, "Material actualizado", { material });
    } catch (error) {
        console.error("Error updating material:", error);
        return handleErrorServer(res, 500, error.message);
    }
};

/**
 * Eliminar material de producto
 * DELETE /api/products/materials/:materialId
 */
export const removeMaterialController = async (req, res) => {
    try {
        const { materialId } = req.params;
        await removeMaterialFromProduct(parseInt(materialId));
        return handleSuccess(res, 200, "Material eliminado del producto");
    } catch (error) {
        console.error("Error removing material:", error);
        return handleErrorServer(res, 500, error.message);
    }
};
