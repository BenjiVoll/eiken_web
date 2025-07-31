"use strict";
import {
    createService as createServiceService,
    updateService as updateServiceService,
    getServices as getServicesService,
    getServiceById as getServiceByIdService,
    deleteService as deleteServiceService,
    deleteServiceImage as deleteServiceImageService,
    getServicesByDivision,
    getServicesByCategory,
    getActiveServices,
    updateServiceRating
} from "../services/service.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { createActivityService } from "../services/activity.service.js";

// Crear un servicio
export const createService = async (req, res) => {
  try {
    const service = await createServiceService(req.body);
    // Registrar actividad
    await createActivityService({
      type: "servicio",
      description: `Nuevo servicio "${service.name}" creado`,
      userId: req.user?.id || null,
    });
    handleSuccess(res, 201, "Servicio creado exitosamente", service);
  } catch (error) {
    handleErrorServer(res, 400, error.message);
  }
};

// Subir imagen de servicio
export const uploadServiceImage = async (req, res) => {
  try {
    const serviceId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }
    // Actualizar el campo image en la entidad Service
    const imageName = req.file.filename;
    const updated = await updateServiceService(serviceId, { image: imageName });
    res.status(200).json({ message: "Imagen subida correctamente", image: imageName, service: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un servicio
export const updateService = async (req, res) => {
    try {
        const service = await updateServiceService(req.params.id, req.body);
        // Registrar actividad de edición
        await createActivityService({
          type: "servicio",
          description: `Servicio "${service.name}" editado`,
          userId: req.user?.id || null,
        });
        handleSuccess(res, 200, "Servicio actualizado exitosamente", service);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
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
        // Obtener el servicio antes de eliminar
        const service = await getServiceByIdService(req.params.id);
        await deleteServiceService(req.params.id);
        // Registrar actividad de eliminación con nombre
        await createActivityService({
          type: "servicio",
          description: `Servicio "${service?.name || ''}" eliminado`,
          userId: req.user?.id || null,
        });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteServiceImage = async (req, res) => {
  try {
    await deleteServiceImageService(req.params.id);
    res.status(200).json({ message: "Imagen eliminada correctamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
