"use strict";
import {
    createInventoryMovement,
    updateInventoryMovement,
    getInventoryMovements,
    getInventoryMovementById,
    deleteInventoryMovement,
    getMovementsByInventory,
    getMovementsByType,
    getMovementsByUser,
    getMovementsByDateRange
} from "../services/inventoryMovement.service.js";

// Crear un movimiento de inventario
export const createInventoryMovementController = async (req, res) => {
    try {
        const movement = await createInventoryMovement(req.body);
        res.status(201).json(movement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar un movimiento de inventario
export const updateInventoryMovementController = async (req, res) => {
    try {
        const movement = await updateInventoryMovement(req.params.id, req.body);
        res.status(200).json(movement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los movimientos de inventario
export const getInventoryMovementsController = async (req, res) => {
    try {
        const movements = await getInventoryMovements();
        res.status(200).json(movements);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener un movimiento de inventario por ID
export const getInventoryMovementByIdController = async (req, res) => {
    try {
        const movement = await getInventoryMovementById(req.params.id);
        if (!movement) {
            return res.status(404).json({ error: "Movimiento de inventario no encontrado" });
        }
        res.status(200).json(movement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener movimientos por item de inventario
export const getMovementsByInventoryController = async (req, res) => {
    try {
        const movements = await getMovementsByInventory(req.params.inventoryId);
        res.status(200).json(movements);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener movimientos por tipo
export const getMovementsByTypeController = async (req, res) => {
    try {
        const movements = await getMovementsByType(req.params.type);
        res.status(200).json(movements);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener movimientos por usuario
export const getMovementsByUserController = async (req, res) => {
    try {
        const movements = await getMovementsByUser(req.params.userId);
        res.status(200).json(movements);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener movimientos por rango de fechas
export const getMovementsByDateRangeController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const movements = await getMovementsByDateRange(startDate, endDate);
        res.status(200).json(movements);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un movimiento de inventario
export const deleteInventoryMovementController = async (req, res) => {
    try {
        await deleteInventoryMovement(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
