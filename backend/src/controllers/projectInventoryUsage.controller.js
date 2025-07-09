"use strict";
import {
    createProjectInventoryUsage,
    updateProjectInventoryUsage,
    getProjectInventoryUsages,
    getProjectInventoryUsageById,
    deleteProjectInventoryUsage,
    getUsagesByProject,
    getUsagesByInventory,
    getUsagesByDateRange
} from "../services/projectInventoryUsage.service.js";

// Crear un uso de inventario en proyecto
export const createProjectInventoryUsageController = async (req, res) => {
    try {
        const usage = await createProjectInventoryUsage(req.body);
        res.status(201).json(usage);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar un uso de inventario en proyecto
export const updateProjectInventoryUsageController = async (req, res) => {
    try {
        const usage = await updateProjectInventoryUsage(req.params.id, req.body);
        res.status(200).json(usage);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los usos de inventario en proyectos
export const getProjectInventoryUsagesController = async (req, res) => {
    try {
        const usages = await getProjectInventoryUsages();
        res.status(200).json(usages);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener un uso de inventario por ID
export const getProjectInventoryUsageByIdController = async (req, res) => {
    try {
        const usage = await getProjectInventoryUsageById(req.params.id);
        if (!usage) {
            return res.status(404).json({ error: "Uso de inventario no encontrado" });
        }
        res.status(200).json(usage);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener usos por proyecto
export const getUsagesByProjectController = async (req, res) => {
    try {
        const usages = await getUsagesByProject(req.params.projectId);
        res.status(200).json(usages);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener usos por item de inventario
export const getUsagesByInventoryController = async (req, res) => {
    try {
        const usages = await getUsagesByInventory(req.params.inventoryId);
        res.status(200).json(usages);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener usos por rango de fechas
export const getUsagesByDateRangeController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const usages = await getUsagesByDateRange(startDate, endDate);
        res.status(200).json(usages);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un uso de inventario en proyecto
export const deleteProjectInventoryUsageController = async (req, res) => {
    try {
        await deleteProjectInventoryUsage(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
