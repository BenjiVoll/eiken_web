"use strict";
import {
    createProject as createProjectService,
    updateProject as updateProjectService,
    getProjects as getProjectsService,
    getProjectById as getProjectByIdService,
    deleteProject as deleteProjectService,
    deleteProjectImage as deleteProjectImageService,
    uploadProjectImage as uploadProjectImageService
} from "../services/project.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

// Crear un proyecto
export const createProject = async (req, res) => {
    try {
        const body = { ...req.body };
        const project = await createProjectService(body);
        handleSuccess(res, 201, "Proyecto creado exitosamente", project);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

// Actualizar un proyecto
export const updateProject = async (req, res) => {
    try {
        const project = await updateProjectService(req.params.id, req.body);
        handleSuccess(res, 200, "Proyecto actualizado exitosamente", project);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

// Obtener todos los proyectos
export const getProjects = async (req, res) => {
    try {
        const projects = await getProjectsService(req.query);
        handleSuccess(res, 200, "Proyectos obtenidos exitosamente", projects);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

// Obtener un proyecto por ID
export const getProject = async (req, res) => {
    try {
        const project = await getProjectByIdService(req.params.id);
        if (!project) {
            return handleErrorClient(res, 404, "Proyecto no encontrado");
        }
        handleSuccess(res, 200, "Proyecto encontrado", project);
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

// Eliminar un proyecto
export const deleteProject = async (req, res) => {
    try {
        await deleteProjectService(req.params.id);
        handleSuccess(res, 200, "Proyecto eliminado exitosamente");
    } catch (error) {
        handleErrorServer(res, 400, error.message);
    }
};

// Subir imagen de proyecto
export const uploadProjectImage = async (req, res) => {
  try {
    const projectId = req.params.id;
    const result = await uploadProjectImageService(projectId, req.file);
    handleSuccess(res, 200, "Imagen subida correctamente", result);
  } catch (error) {
    handleErrorServer(res, 400, error.message);
  }
};

// Eliminar imagen de proyecto
export const deleteProjectImage = async (req, res) => {
  try {
    const result = await deleteProjectImageService(req.params.id);
    handleSuccess(res, 200, result.mensaje);
  } catch (error) {
    handleErrorServer(res, 400, error.message);
  }
};
