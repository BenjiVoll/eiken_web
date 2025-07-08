"use strict";
import {
    createProveedor,
    updateProveedor,
    getProveedores,
    getProveedorById,
    deleteProveedor
} from "../services/proveedor.service.js";

// Crear un proveedor
export const createProveedorController = async (req, res) => {
    try {
        const proveedor = await createProveedor(req.body);
        res.status(201).json(proveedor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar un proveedor
export const updateProveedorController = async (req, res) => {
    try {
        const proveedor = await updateProveedor(req.params.id, req.body);
        res.status(200).json(proveedor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los proveedores
export const getProveedoresController = async (req, res) => {
    try {
        const proveedores = await getProveedores();
        res.status(200).json(proveedores);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener un proveedor por ID
export const getProveedorByIdController = async (req, res) => {
    try {
        const proveedor = await getProveedorById(req.params.id);
        if (!proveedor) {
            return res.status(404).json({ error: "Proveedor no encontrado" });
        }
        res.status(200).json(proveedor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un proveedor
export const deleteProveedorController = async (req, res) => {
    try {
        await deleteProveedor(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
