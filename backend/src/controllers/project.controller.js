"use strict";
import {
    createProject as createProjectService,
    updateProject as updateProjectService,
    getProjects as getProjectsService,
    getProjectById as getProjectByIdService,
    deleteProject as deleteProjectService
} from "../services/project.service.js";

// Crear un proyecto
export const createProject = async (req, res) => {
    try {
        const project = await createProjectService(req.body);
        res.status(201).json({
            status: "success",
            message: "Proyecto creado exitosamente",
            data: project
        });
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            message: error.message 
        });
    }
};

// Actualizar un proyecto
export const updateProject = async (req, res) => {
    try {
        const project = await updateProjectService(req.params.id, req.body);
        res.status(200).json({
            status: "success",
            message: "Proyecto actualizado exitosamente",
            data: project
        });
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            message: error.message 
        });
    }
};

// Obtener todos los proyectos
export const getProjects = async (req, res) => {
    try {
        const projects = await getProjectsService(req.query);
        res.status(200).json({
            status: "success",
            message: "Proyectos obtenidos exitosamente",
            data: projects
        });
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            message: error.message 
        });
    }
};

// Obtener un proyecto por ID
export const getProject = async (req, res) => {
    try {
        const project = await getProjectByIdService(req.params.id);
        if (!project) {
            return res.status(404).json({ 
                status: "error",
                message: "Proyecto no encontrado" 
            });
        }
        res.status(200).json({
            status: "success",
            message: "Proyecto encontrado",
            data: project
        });
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            message: error.message 
        });
    }
};

// Eliminar un proyecto
export const deleteProject = async (req, res) => {
    try {
        await deleteProjectService(req.params.id);
        res.status(200).json({
            status: "success",
            message: "Proyecto eliminado exitosamente"
        });
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            message: error.message 
        });
    }
};
