"use strict";
import { AppDataSource } from "../config/configDb.js";
import { ProjectSchema } from "../entity/proyectosServicios.entity.js";
import { ClientSchema } from "../entity/user.entity.cliente.js";

const projectRepository = AppDataSource.getRepository(ProjectSchema);
const clientRepository = AppDataSource.getRepository(ClientSchema);

export const createProject = async (data) => {
  const { title, description, clientId, division, category, startDate, estimatedEndDate, budgetAmount, year, month, imageUrl, awards, tags, isFeatured, isPublic } = data;
  
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

  const project = projectRepository.create({
    title,
    description,
    clientId,
    division,
    category,
    status: "pending",
    startDate,
    estimatedEndDate,
    budgetAmount,
    year: year || new Date().getFullYear(),
    month: month || new Date().toLocaleString('es-ES', { month: 'long' }),
    imageUrl,
    awards: awards || [],
    tags: tags || [],
    isFeatured: isFeatured || false,
    isPublic: isPublic || false
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

  Object.assign(project, data);
  await projectRepository.save(project);
  return project;
};

export const getProjects = async () => {
  const projects = await projectRepository.find({
    relations: ["client"],
    order: { startDate: "DESC" }
  });
  return projects;
};

export const getProjectById = async (id) => {
  const project = await projectRepository.findOne({
    where: { id },
    relations: ["client", "inventoryUsages"]
  });
  return project;
};

export const getProjectsByDivision = async (division) => {
  const validDivisions = ["Design", "Truck Design", "Racing Design"];
  if (!validDivisions.includes(division)) {
    throw new Error("División no válida");
  }

  const projects = await projectRepository.find({
    where: { division },
    relations: ["client"],
    order: { startDate: "DESC" }
  });
  return projects;
};

export const getProjectsByStatus = async (status) => {
  const validStatuses = ["pending", "in_progress", "completed", "cancelled", "on_hold"];
  if (!validStatuses.includes(status)) {
    throw new Error("Estado de proyecto no válido");
  }

  const projects = await projectRepository.find({
    where: { status },
    relations: ["client"],
    order: { startDate: "DESC" }
  });
  return projects;
};

export const getProjectsByClient = async (clientId) => {
  const projects = await projectRepository.find({
    where: { clientId },
    relations: ["client"],
    order: { startDate: "DESC" }
  });
  return projects;
};

export const getFeaturedProjects = async () => {
  const projects = await projectRepository.find({
    where: { isFeatured: true },
    relations: ["client"],
    order: { startDate: "DESC" }
  });
  return projects;
};

export const getPublicProjects = async () => {
  const projects = await projectRepository.find({
    where: { isPublic: true },
    relations: ["client"],
    order: { startDate: "DESC" }
  });
  return projects;
};

export const updateProjectStatus = async (id, newStatus) => {
  const validStatuses = ["pending", "in_progress", "completed", "cancelled", "on_hold"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Estado de proyecto no válido");
  }

  const project = await projectRepository.findOneBy({ id });
  if (!project) {
    throw new Error("Proyecto no encontrado");
  }

  project.status = newStatus;
  
  // Si se marca como completado, establecer fecha actual de finalización
  if (newStatus === "completed" && !project.actualEndDate) {
    project.actualEndDate = new Date();
  }

  await projectRepository.save(project);
  return project;
};

export const deleteProject = async (id) => {
  const project = await projectRepository.findOneBy({ id });
  if (!project) {
    throw new Error("Proyecto no encontrado");
  }

  await projectRepository.remove(project);
  return { mensaje: "Proyecto eliminado exitosamente" };
};
