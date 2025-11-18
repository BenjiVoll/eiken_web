"use strict";
import fs from "fs";
import path from "path";
import { AppDataSource } from "../config/configDb.js";
import { ProjectSchema } from "../entity/project.entity.js";
import { ProjectStatusSchema } from "../entity/projectStatus.entity.js";
import { ClientSchema } from "../entity/user.entity.client.js";
import { CategorySchema } from "../entity/category.entity.js";
import { DivisionSchema } from "../entity/division.entity.js";

const projectRepository = AppDataSource.getRepository(ProjectSchema);
const projectStatusRepository = AppDataSource.getRepository(ProjectStatusSchema);
const clientRepository = AppDataSource.getRepository(ClientSchema);
const categoryRepository = AppDataSource.getRepository(CategorySchema);
const divisionRepository = AppDataSource.getRepository(DivisionSchema);

export const createProject = async (data) => {
  const { title, description, clientId, categoryId, divisionId, statusId, priority, budgetAmount, notes, quoteId } = data;
  
  // Verificar que el cliente existe
  const client = await clientRepository.findOneBy({ id: clientId });
  if (!client) {
    throw new Error("Cliente no encontrado");
  }

  // Verificar si ya existe un proyecto con el mismo título para el mismo cliente
  const existingProject = await projectRepository.findOne({ 
    where: {
      client: { id: clientId },
      title 
    }
  });
  if (existingProject) {
    throw new Error("Ya existe un proyecto con este título para este cliente");
  }

  // Verificar que la categoría existe
  if (categoryId) {
    const category = await categoryRepository.findOneBy({ id: categoryId });
    if (!category) {
      throw new Error("Categoría no encontrada");
    }
  }

  // Verificar que la división existe
  if (divisionId) {
    const division = await divisionRepository.findOneBy({ id: divisionId });
    if (!division) {
      throw new Error("División no encontrada");
    }
  }

  // Obtener el estado (si no se proporciona, usar "Pendiente" por defecto)
  let projectStatus;
  if (statusId) {
    projectStatus = await projectStatusRepository.findOneBy({ id: statusId });
    if (!projectStatus) {
      throw new Error("Estado de proyecto no encontrado");
    }
  } else {
    projectStatus = await projectStatusRepository.findOneBy({ name: "Pendiente" });
    if (!projectStatus) {
      throw new Error("Estado 'Pendiente' no encontrado. Asegúrate de que los estados estén inicializados.");
    }
  }

  const project = projectRepository.create({
    title,
    description,
    client: { id: clientId },
    category: categoryId ? { id: categoryId } : null,
    division: divisionId ? { id: divisionId } : null,
    projectStatus,
    priority: priority || "Medio",
    budgetAmount,
    notes,
    quote: quoteId ? { id: quoteId } : null
  });

  await projectRepository.save(project);
  return project;
};

export const updateProject = async (id, data) => {
  const project = await projectRepository.findOne({
    where: { id },
    relations: ["client", "category", "division", "projectStatus"]
  });
  if (!project) {
    throw new Error("Proyecto no encontrado");
  }

  // Si se está cambiando el cliente, verificar que existe
  if (data.clientId && data.clientId !== project.client.id) {
    const client = await clientRepository.findOneBy({ id: data.clientId });
    if (!client) {
      throw new Error("Cliente no encontrado");
    }
    project.client = client;
    delete data.clientId;
  }

  // Si se está actualizando el título, verificar que no exista otro con el mismo título para el mismo cliente
  if (data.title && data.title !== project.title) {
    const clientId = data.clientId || project.client.id;
    const existingProject = await projectRepository.findOne({ 
      where: {
        client: { id: clientId },
        title: data.title
      }
    });
    if (existingProject && existingProject.id !== id) {
      throw new Error("Ya existe un proyecto con este título para este cliente");
    }
  }

  // Si se actualiza el estado
  if (data.statusId) {
    const newStatus = await projectStatusRepository.findOneBy({ id: data.statusId });
    if (!newStatus) {
      throw new Error("Estado de proyecto no encontrado");
    }
    project.projectStatus = newStatus;
    delete data.statusId;
  }

  // Si se actualiza la categoría
  if (data.categoryId) {
    const category = await categoryRepository.findOneBy({ id: data.categoryId });
    if (!category) {
      throw new Error("Categoría no encontrada");
    }
    project.category = category;
    delete data.categoryId;
  }

  // Si se actualiza la división
  if (data.divisionId) {
    const division = await divisionRepository.findOneBy({ id: data.divisionId });
    if (!division) {
      throw new Error("División no encontrada");
    }
    project.division = division;
    delete data.divisionId;
  }

  // Asignar el resto de campos
  Object.assign(project, data);
  await projectRepository.save(project);
  
  // Recargar con relaciones actualizadas
  return await projectRepository.findOne({
    where: { id },
    relations: ["client", "category", "division", "projectStatus", "quote"]
  });
};

export const getProjects = async () => {
  const projects = await projectRepository.find({
    relations: ["client", "category", "division", "projectStatus"],
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
