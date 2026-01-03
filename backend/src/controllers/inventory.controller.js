"use strict";
import {
    createInventoryItem as createInventoryItemService,
    updateInventoryItem as updateInventoryItemService,
    getInventoryItems as getInventoryItemsService,
    getInventoryItemById as getInventoryItemByIdService,
    deleteInventoryItem as deleteInventoryItemService,
    getInventoryByType as getInventoryByTypeService,
    getLowStockItems as getLowStockItemsService,
    updateInventoryQuantity as updateInventoryQuantityService
} from "../services/inventory.service.js";
import { createActivityService } from "../services/activity.service.js";
import { checkAndAlertLowStock, getLowStockCount } from "../services/alert.service.js";

// Crear un item de inventario
export const createInventory = async (req, res) => {
    try {
        const item = await createInventoryItemService(req.body);
        // Registrar actividad
        await createActivityService({
            type: "inventario",
            description: `Nuevo material "${item.name}" agregado al inventario`,
            userId: req.user?.id || null,
        });
        res.status(201).json({
            status: "success",
            message: "Item de inventario creado exitosamente",
            data: item
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
};

// Actualizar un item de inventario
export const updateInventory = async (req, res) => {
    try {
        const item = await updateInventoryItemService(req.params.id, req.body);
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los items de inventario
export const getInventories = async (req, res) => {
    try {
        const items = await getInventoryItemsService();
        res.status(200).json({
            status: "success",
            message: "Items de inventario obtenidos exitosamente",
            data: items
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
};

// Obtener un item de inventario por ID
export const getInventory = async (req, res) => {
    try {
        const item = await getInventoryItemByIdService(req.params.id);
        if (!item) {
            return res.status(404).json({
                status: "error",
                message: "Item de inventario no encontrado"
            });
        }
        res.status(200).json({
            status: "success",
            message: "Item de inventario encontrado",
            data: item
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
};

// Obtener inventario por tipo
export const getInventoryByType = async (req, res) => {
    try {
        const items = await getInventoryByTypeService(req.params.type);
        res.status(200).json(items);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener items con bajo stock
export const getLowStockItems = async (req, res) => {
    try {
        const items = await getLowStockItemsService();
        res.status(200).json(items);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



// Actualizar cantidad de inventario
export const updateInventoryQuantity = async (req, res) => {
    try {
        const item = await updateInventoryQuantityService(req.params.id, req.body.quantity);
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un item de inventario
export const deleteInventory = async (req, res) => {
    try {
        await deleteInventoryItemService(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Verificar stock bajo y enviar alerta por email
export const checkLowStockAlerts = async (req, res) => {
    try {
        const result = await checkAndAlertLowStock();

        res.status(200).json({
            status: "success",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// Obtener conteo de items con stock bajo (para dashboard)
export const getLowStockItemsCount = async (req, res) => {
    try {
        const count = await getLowStockCount();

        res.status(200).json({
            status: "success",
            data: { count }
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};
