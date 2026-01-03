"use strict";
import {
    registerMaterialsUsage as registerMaterialsUsageService,
    getMaterialsUsedByOrder as getMaterialsUsedByOrderService,
    deleteMaterialUsage as deleteMaterialUsageService,
} from "../services/orderInventoryUsage.service.js";

/**
 * Registrar materiales usados en una orden
 */
export const registerMaterialsUsage = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { materials } = req.body;

        if (!materials || !Array.isArray(materials) || materials.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Debes proporcionar al menos un material",
            });
        }

        const result = await registerMaterialsUsageService(
            parseInt(orderId),
            materials,
            req.user.id
        );

        res.status(201).json({
            status: "success",
            message: "Materiales registrados exitosamente",
            data: result,
        });
    } catch (error) {
        console.error("Error en registerMaterialsUsage:", error);
        res.status(400).json({
            status: "error",
            message: error.message || "Error al registrar materiales",
        });
    }
};

/**
 * Obtener materiales usados en una orden
 */
export const getOrderMaterials = async (req, res) => {
    try {
        const { orderId } = req.params;
        const materials = await getMaterialsUsedByOrderService(parseInt(orderId));

        res.status(200).json({
            status: "success",
            data: materials,
        });
    } catch (error) {
        console.error("Error en getOrderMaterials:", error);
        res.status(500).json({
            status: "error",
            message: error.message || "Error al obtener materiales",
        });
    }
};

/**
 * Eliminar registro de material usado
 */
export const deleteMaterialUsage = async (req, res) => {
    try {
        const { usageId } = req.params;
        const result = await deleteMaterialUsageService(
            parseInt(usageId),
            req.user.id
        );

        res.status(200).json({
            status: "success",
            message: result.message,
        });
    } catch (error) {
        console.error("Error en deleteMaterialUsage:", error);
        res.status(400).json({
            status: "error",
            message: error.message || "Error al eliminar registro",
        });
    }
};
