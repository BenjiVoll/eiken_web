"use strict";
import {
    createProduct as createProductService,
    updateProduct as updateProductService,
    getProducts as getProductsService,
    getActiveProducts as getActiveProductsService,
    getProductById as getProductByIdService,
    deleteProduct as deleteProductService,
    deleteProductImage as deleteProductImageService
} from "../services/product.service.js";
import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

export const createProduct = async (req, res) => {
    try {
        const product = await createProductService(req.body);
        handleSuccess(res, 201, "Producto creado exitosamente", product);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await updateProductService(req.params.id, req.body);
        handleSuccess(res, 200, "Producto actualizado exitosamente", product);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await getProductsService();
        handleSuccess(res, 200, "Productos obtenidos exitosamente", products);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

export const getActiveProducts = async (req, res) => {
    try {
        const products = await getActiveProductsService();
        handleSuccess(res, 200, "Productos activos obtenidos exitosamente", products);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

export const getProduct = async (req, res) => {
    try {
        const product = await getProductByIdService(req.params.id);
        if (!product) {
            return handleErrorClient(res, 404, "Producto no encontrado");
        }
        handleSuccess(res, 200, "Producto encontrado", product);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

export const deleteProduct = async (req, res) => {
    try {
        await deleteProductService(req.params.id);
        handleSuccess(res, 200, "Producto eliminado exitosamente");
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

export const uploadProductImage = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!req.file) {
            return res.status(400).json({ error: "No se subió ningún archivo" });
        }
        const imageName = req.file.filename;
        const updated = await updateProductService(productId, { image: imageName });
        res.status(200).json({ message: "Imagen subida correctamente", image: imageName, product: updated });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteProductImage = async (req, res) => {
    try {
        await deleteProductImageService(req.params.id);
        handleSuccess(res, 200, "Imagen eliminada correctamente");
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};
