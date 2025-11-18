"use strict";
import { AppDataSource } from "../config/configDb.js";
import { ProjectStatusSchema } from "../entity/projectStatus.entity.js";

const projectStatusRepository = AppDataSource.getRepository(ProjectStatusSchema);

export const getProjectStatuses = async () => {
  return await projectStatusRepository.find({
    order: { id: "ASC" }
  });
};

export const getProjectStatusById = async (id) => {
  const status = await projectStatusRepository.findOneBy({ id });
  if (!status) {
    throw new Error("Estado de proyecto no encontrado");
  }
  return status;
};

export const getProjectStatusByName = async (name) => {
  const status = await projectStatusRepository.findOneBy({ name });
  if (!status) {
    throw new Error(`Estado de proyecto '${name}' no encontrado`);
  }
  return status;
};

export const createProjectStatus = async (data) => {
  const { name, description, colorCode } = data;
  
  const existingStatus = await projectStatusRepository.findOneBy({ name });
  if (existingStatus) {
    throw new Error("Ya existe un estado con este nombre");
  }

  const status = projectStatusRepository.create({
    name,
    description,
    colorCode
  });

  await projectStatusRepository.save(status);
  return status;
};

export const updateProjectStatus = async (id, data) => {
  const status = await projectStatusRepository.findOneBy({ id });
  if (!status) {
    throw new Error("Estado de proyecto no encontrado");
  }

  if (data.name && data.name !== status.name) {
    const existingStatus = await projectStatusRepository.findOneBy({ name: data.name });
    if (existingStatus) {
      throw new Error("Ya existe un estado con este nombre");
    }
  }

  Object.assign(status, data);
  await projectStatusRepository.save(status);
  return status;
};

export const deleteProjectStatus = async (id) => {
  const status = await projectStatusRepository.findOneBy({ id });
  if (!status) {
    throw new Error("Estado de proyecto no encontrado");
  }

  await projectStatusRepository.remove(status);
  return { message: "Estado eliminado correctamente" };
};
