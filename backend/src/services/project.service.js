"use strict";
import { AppDataSource } from "../config/configDb.js";
import { ProjectSchema } from "../entity/project.entity.js";
import { ClientSchema } from "../entity/user.entity.client.js";

const projectRepository = AppDataSource.getRepository(ProjectSchema);
const clientRepository = AppDataSource.getRepository(ClientSchema);

export const createProject = async (data) => {
  console.log('Creating project with data:', data);
  const { title, description, clientId, projectType, division, status, priority, budgetAmount, notes, quoteId } = data;
  
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
    projectType: projectType || "otro",
    division: division || "design",
    status: data.status || "pending",
    priority: priority || "medium",
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

  Object.assign(project, data);
  await projectRepository.save(project);
  return project;
};

export const getProjects = async () => {
  const projects = await projectRepository.find({
    relations: ["client"],
    order: { createdAt: "DESC" }
  });
  return projects;
};

export const getProjectById = async (id) => {
  const project = await projectRepository.findOne({
    where: { id },
    relations: ["client"]
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
    order: { createdAt: "DESC" }
  });
  return projects;
};

export const getProjectsByStatus = async (status) => {
  const validStatuses = ["Pendiente", "En Proceso", "Aprobada", "Completado", "Cancelado"];
  if (!validStatuses.includes(status)) {
    throw new Error("Estado de proyecto no válido");
  }

  const projects = await projectRepository.find({
    where: { status },
    relations: ["client"],
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
