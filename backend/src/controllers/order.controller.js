"use strict";
import {
    createOrder,
    updateOrder,
    getOrders,
    getOrderById,
    deleteOrder,
    getOrdersByStatus,
    getOrdersByClient,
    addOrderItem,
    removeOrderItem,
    updateOrderStatus
} from "../services/order.service.js";

// Crear una orden
export const createOrderController = async (req, res) => {
    try {
        const order = await createOrder(req.body);
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar una orden
export const updateOrderController = async (req, res) => {
    try {
        const order = await updateOrder(req.params.id, req.body);
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todas las órdenes
export const getOrdersController = async (req, res) => {
    try {
        const orders = await getOrders();
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener una orden por ID
export const getOrderByIdController = async (req, res) => {
    try {
        const order = await getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Orden no encontrada" });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener órdenes por estado
export const getOrdersByStatusController = async (req, res) => {
    try {
        const orders = await getOrdersByStatus(req.params.status);
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener órdenes por cliente
export const getOrdersByClientController = async (req, res) => {
    try {
        const orders = await getOrdersByClient(req.params.clientId);
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Agregar item a una orden
export const addOrderItemController = async (req, res) => {
    try {
        const orderItem = await addOrderItem(req.params.id, req.body);
        res.status(201).json(orderItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Remover item de una orden
export const removeOrderItemController = async (req, res) => {
    try {
        await removeOrderItem(req.params.orderId, req.params.itemId);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar estado de orden
export const updateOrderStatusController = async (req, res) => {
    try {
        const order = await updateOrderStatus(req.params.id, req.body.status);
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar una orden
export const deleteOrderController = async (req, res) => {
    try {
        await deleteOrder(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
