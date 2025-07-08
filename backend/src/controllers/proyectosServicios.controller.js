"use strict";
import {
    createProyectoServicio,
    updateProyectoServicio,
    getProyectosServicios,
    getProyectoServicioById,
    deleteProyectoServicio
} from "../services/proyectoServicio.service.js";

// Crear un proyecto servicio
export const createProyectoServicioController = async (req, res) => {
    try {
        const proyecto = await createProyectoServicio(req.body);
        res.status(201).json(proyecto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar un proyecto servicio
export const updateProyectoServicioController = async (req, res) => {
    try {
        const proyecto = await updateProyectoServicio(req.params.id, req.body);
        res.status(200).json(proyecto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los proyectos servicios
export const getProyectosServiciosController = async (req, res) => {
    try {
        const proyectos = await getProyectosServicios();
        res.status(200).json(proyectos);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener un proyecto servicio por ID
export const getProyectoServicioByIdController = async (req, res) => {
    try {
        const proyecto = await getProyectoServicioById(req.params.id);
        if (!proyecto) {
            return res.status(404).json({ error: "Proyecto servicio no encontrado" });
        }
        res.status(200).json(proyecto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un proyecto servicio
export const deleteProyectoServicioController = async (req, res) => {
    try {
        await deleteProyectoServicio(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
