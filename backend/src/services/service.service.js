"use strict";
import { AppDataSource } from "../config/configDb.js";
import { ServiceSchema } from "../entity/service.entity.js";

const serviceRepository = AppDataSource.getRepository(ServiceSchema);

export const createService = async (data) => {
  const { name, description, category, division, price, imageUrl, rating } = data;
  
  // Verificar si ya existe un servicio con el mismo nombre
  const existingService = await serviceRepository.findOneBy({ name });
  if (existingService) {
    throw new Error("Ya existe un servicio con este nombre");
  }

  const service = serviceRepository.create({
    name,
    description,
    category,
    division,
    price,
    imageUrl,
    rating: rating || 0,
    isActive: true
  });

  await serviceRepository.save(service);
  return service;
};

export const updateService = async (id, data) => {
  const service = await serviceRepository.findOneBy({ id });
  if (!service) {
    throw new Error("Servicio no encontrado");
  }

  // Si se está actualizando el nombre, verificar que no exista otro servicio con ese nombre
  if (data.name && data.name !== service.name) {
    const existingService = await serviceRepository.findOneBy({ name: data.name });
    if (existingService) {
      throw new Error("Ya existe un servicio con este nombre");
    }
  }

  Object.assign(service, data);
  await serviceRepository.save(service);
  return service;
};

export const getServices = async () => {
  const services = await serviceRepository.find({
    order: { name: "ASC" }
  });
  return services;
};

export const getActiveServices = async () => {
  const services = await serviceRepository.find({
    where: { isActive: true },
    order: { name: "ASC" }
  });
  return services;
};

export const getServiceById = async (id) => {
  const service = await serviceRepository.findOne({
    where: { id },
    relations: ["orderItems"]
  });
  return service;
};

export const getServicesByDivision = async (division) => {
  const validDivisions = ["Design", "Truck Design", "Racing Design"];
  if (!validDivisions.includes(division)) {
    throw new Error("División no válida");
  }

  const services = await serviceRepository.find({
    where: { division, isActive: true },
    order: { name: "ASC" }
  });
  return services;
};

export const getServicesByCategory = async (category) => {
  const services = await serviceRepository.find({
    where: { category, isActive: true },
    order: { name: "ASC" }
  });
  return services;
};

export const updateServiceRating = async (id, rating) => {
  if (rating < 0 || rating > 5) {
    throw new Error("El rating debe estar entre 0 y 5");
  }

  const service = await serviceRepository.findOneBy({ id });
  if (!service) {
    throw new Error("Servicio no encontrado");
  }

  service.rating = rating;
  await serviceRepository.save(service);
  return service;
};

export const deleteService = async (id) => {
  const service = await serviceRepository.findOneBy({ id });
  if (!service) {
    throw new Error("Servicio no encontrado");
  }

  // Soft delete - marcar como inactivo
  service.isActive = false;
  await serviceRepository.save(service);
  
  return { mensaje: "Servicio eliminado exitosamente" };
};
