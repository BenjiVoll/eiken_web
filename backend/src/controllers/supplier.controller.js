"use strict";
import {
    createSupplier as createSupplierService,
    updateSupplier as updateSupplierService,
    getSuppliers as getSuppliersService,
    getSupplierById as getSupplierByIdService,
    deleteSupplier as deleteSupplierService,
    getSupplierByEmail as getSupplierByEmailService,
    getSupplierByRut as getSupplierByRutService,
    getActiveSuppliers as getActiveSuppliersService
} from "../services/supplier.service.js";

// Crear un proveedor
export const createSupplier = async (req, res) => {
    try {
        const supplier = await createSupplierService(req.body);
        res.status(201).json({
            status: "success",
            message: "Proveedor creado exitosamente",
            data: supplier
        });
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            message: error.message 
        });
    }
};

// Actualizar un proveedor
export const updateSupplier = async (req, res) => {
    try {
        const supplier = await updateSupplierService(req.params.id, req.body);
        res.status(200).json({
            status: "success",
            message: "Proveedor actualizado exitosamente",
            data: supplier
        });
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            message: error.message 
        });
    }
};

// Obtener todos los proveedores
export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await getSuppliersService(req.query);
        res.status(200).json({
            status: "success",
            message: "Proveedores obtenidos exitosamente",
            data: suppliers
        });
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            message: error.message 
        });
    }
};

// Obtener un proveedor por ID
export const getSupplier = async (req, res) => {
    try {
        const supplier = await getSupplierByIdService(req.params.id);
        if (!supplier) {
            return res.status(404).json({ 
                status: "error",
                message: "Proveedor no encontrado" 
            });
        }
        res.status(200).json({
            status: "success",
            message: "Proveedor encontrado",
            data: supplier
        });
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            message: error.message 
        });
    }
};

// Eliminar un proveedor
export const deleteSupplier = async (req, res) => {
    try {
        await deleteSupplierService(req.params.id);
        res.status(200).json({
            status: "success",
            message: "Proveedor eliminado exitosamente"
        });
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            message: error.message 
        });
    }
};
