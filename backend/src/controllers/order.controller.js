"use strict";
import {
    createOrder as createOrderService,
    getOrders as getOrdersService,
    getOrderById as getOrderByIdService,
    updateOrderStatus as updateOrderStatusService,
    getOrdersByEmail as getOrdersByEmailService,
    deleteOrder as deleteOrderService
} from "../services/order.service.js";
import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

export const createOrder = async (req, res) => {
    try {
        const order = await createOrderService(req.body);
        handleSuccess(res, 201, "Orden creada exitosamente", order);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await getOrdersService();
        handleSuccess(res, 200, "Órdenes obtenidas exitosamente", orders);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await getOrderByIdService(req.params.id);
        if (!order) {
            return handleErrorClient(res, 404, "Orden no encontrada");
        }
        handleSuccess(res, 200, "Orden encontrada", order);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const order = await updateOrderStatusService(req.params.id, req.body.status);
        handleSuccess(res, 200, "Estado de orden actualizado exitosamente", order);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

export const getOrdersByEmail = async (req, res) => {
    try {
        const orders = await getOrdersByEmailService(req.params.email);
        handleSuccess(res, 200, "Órdenes obtenidas exitosamente", orders);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

export const deleteOrder = async (req, res) => {
    try {
        await deleteOrderService(req.params.id);
        handleSuccess(res, 200, "Orden eliminada exitosamente");
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};
