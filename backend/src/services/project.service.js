"use strict";
import fs from "fs";
import path from "path";
import { AppDataSource } from "../config/configDb.js";
import { ProjectSchema } from "../entity/project.entity.js";
import { ClientSchema } from "../entity/user.entity.client.js";
import { DivisionSchema } from "../entity/division.entity.js";

const projectRepository = AppDataSource.getRepository(ProjectSchema);
const clientRepository = AppDataSource.getRepository(ClientSchema);
const divisionRepository = AppDataSource.getRepository(DivisionSchema);

export const createProject = async (data) => {
  const { title, description, clientId, categoryId, division, status, priority, budgetAmount, notes, quoteId } = data;
  
  // Verificar que el cliente existe
  const client = await clientRepository.findOneBy({ id: clientId });
  if (!client) {
    throw new Error("Cliente no encontrado");
  }

  // Verificar si ya existe un proyecto con el mismo título para el mismo cliente
  const existingProject = await projectRepository.findOneBy({ 
    clientId, 
    title 
  });
  if (existingProject) {
    throw new Error("Ya existe un proyecto con este título para este cliente");
  }

  // Verificar que la división existe
  const divisionEntity = await divisionRepository.findOneBy({ id: division });
  if (!divisionEntity) {
    throw new Error("División no encontrada");
  }

  const project = projectRepository.create({
    title,
    description,
    clientId,
    projectType: categoryId,
    division,
    status,
    priority,
    budgetAmount,
    notes,
    quoteId
  });

  await projectRepository.save(project);
  return project;
};

export const updateProject = async (id, data) => {
  const project = await projectRepository.findOneBy({ id });
  if (!project) {
    throw new Error("Proyecto no encontrado");
  }

  // Si se está cambiando el cliente, verificar que existe
  if (data.clientId && data.clientId !== project.clientId) {
    const client = await clientRepository.findOneBy({ id: data.clientId });
    if (!client) {
      throw new Error("Cliente no encontrado");
    }
  }

  // Si se está actualizando el título, verificar que no exista otro con el mismo título para el mismo cliente
  if (data.title && data.title !== project.title) {
    const clientId = data.clientId || project.clientId;
    const existingProject = await projectRepository.findOneBy({ 
      clientId, 
      title: data.title 
    });
    if (existingProject && existingProject.id !== id) {
      throw new Error("Ya existe un proyecto con este título para este cliente");
    }
  }

  // Si se actualiza categoryId, mapear a projectType
  if (data.categoryId) {
    project.projectType = data.categoryId;
    delete data.categoryId;
  }
  // Asignar el resto de campos
  Object.assign(project, data);
  await projectRepository.save(project);
  return project;
};

export const getProjects = async () => {
  const projects = await projectRepository.find({
    relations: ["client", "category", "division"],
    order: { createdAt: "DESC" }
  });
  return projects;
};

export const getProjectById = async (id) => {
  const project = await projectRepository.findOne({
    where: { id },
    relations: ["client", "category", "division"]
  });
  return project;
};

export const getProjectsByDivision = async (division) => {
  if (!division || typeof division !== "number") {
    throw new Error("División no válida");
  }
  const projects = await projectRepository.find({
    where: { division },
    relations: ["client", "category", "division"],
    order: { createdAt: "DESC" }
  });
  return projects;
};

export const getProjectsByStatus = async (status) => {
  const validStatuses = ["Pendiente", "En Proceso", "Aprobado", "Completado", "Cancelado"];
  if (!validStatuses.includes(status)) {
    throw new Error("Estado de proyecto no válido");
  }
  const projects = await projectRepository.find({
    where: { status },
    relations: ["client", "category", "division"],
    order: { createdAt: "DESC" }
  });
  return projects;
};

export const getProjectsByClient = async (clientId) => {
  const projects = await projectRepository.find({
    where: { clientId },
    relations: ["client"],
    order: { createdAt: "DESC" }
  });
  return projects;
};

export const deleteProject = async (id) => {
  const project = await projectRepository.findOneBy({ id });
  if (!project) {
    throw new Error("Proyecto no encontrado");
  }

  await projectRepository.remove(project);
  return { mensaje: "Proyecto eliminado exitosamente" };
};

// --- Funciones de imagen ---
export const deleteProjectImage = async (id) => {
  const project = await projectRepository.findOneBy({ id });
  if (!project) throw new Error("Proyecto no encontrado");
  if (!project.image) return { mensaje: "El proyecto no tiene imagen" };
  const imagePath = path.join(process.cwd(), "uploads", project.image);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
  project.image = null;
  await projectRepository.save(project);
  return { mensaje: "Imagen eliminada correctamente" };
};
export const uploadProjectImage = async (id, file) => {
  if (!file) throw new Error("No se subió ningún archivo");
  const project = await projectRepository.findOneBy({ id });
  if (!project) throw new Error("Proyecto no encontrado");
  // Eliminar imagen anterior si existe
  if (project.image) {
    const oldImagePath = path.join(process.cwd(), "uploads", project.image);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }
  // Guardar nueva imagen
  project.image = file.filename;
  await projectRepository.save(project);
  return { image: file.filename, project };
};
