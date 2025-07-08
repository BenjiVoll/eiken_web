"use strict";
import {
    createProductoVinilo,
    updateProductoVinilo,
    getProductosVinilo,
    getProductoViniloById,
    deleteProductoVinilo
} from "../services/productoVinilo.service.js";

// Crear un producto vinilo
export const createProductoViniloController = async (req, res) => {
    try {
        const producto = await createProductoVinilo(req.body);
        res.status(201).json(producto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar un producto vinilo
export const updateProductoViniloController = async (req, res) => {
    try {
        const producto = await updateProductoVinilo(req.params.id, req.body);
        res.status(200).json(producto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los productos vinilo
export const getProductosViniloController = async (req, res) => {
    try {
        const productos = await getProductosVinilo();
        res.status(200).json(productos);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener un producto vinilo por ID
export const getProductoViniloByIdController = async (req, res) => {
    try {
        const producto = await getProductoViniloById(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.status(200).json(producto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un producto vinilo
export const deleteProductoViniloController = async (req, res) => {
    try {
        await deleteProductoVinilo(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};