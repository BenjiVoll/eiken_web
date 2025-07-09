"use strict";
import {
    createService as createServiceService,
    updateService as updateServiceService,
    getServices as getServicesService,
    getServiceById as getServiceByIdService,
    deleteService as deleteServiceService,
    getServicesByDivision,
    getServicesByCategory,
    getActiveServices,
    updateServiceRating
} from "../services/service.service.js";

// Crear un servicio
export const createService = async (req, res) => {
    try {
        const service = await createServiceService(req.body);
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar un servicio
export const updateService = async (req, res) => {
    try {
        const service = await updateServiceService(req.params.id, req.body);
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los servicios
export const getServices = async (req, res) => {
    try {
        const services = await getServicesService();
        res.status(200).json({
            status: "success",
            message: "Servicios obtenidos exitosamente",
            data: services
        });
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            message: error.message 
        });
    }
};

// Obtener servicios activos
export const getActiveServicesController = async (req, res) => {
    try {
        const services = await getActiveServices();
        res.status(200).json(services);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener un servicio por ID
export const getService = async (req, res) => {
    try {
        const service = await getServiceByIdService(req.params.id);
        if (!service) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener servicios por división
export const getServicesByDivisionController = async (req, res) => {
    try {
        const services = await getServicesByDivision(req.params.division);
        res.status(200).json(services);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener servicios por categoría
export const getServicesByCategoryController = async (req, res) => {
    try {
        const services = await getServicesByCategory(req.params.category);
        res.status(200).json(services);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar rating de servicio
export const updateServiceRatingController = async (req, res) => {
    try {
        const service = await updateServiceRating(req.params.id, req.body.rating);
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un servicio
export const deleteService = async (req, res) => {
    try {
        await deleteServiceService(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
