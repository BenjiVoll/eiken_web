"use strict";
import fs from "fs";
import path from "path";
import { AppDataSource } from "../config/configDb.js";
import { ServiceSchema } from "../entity/service.entity.js";
import { CategorySchema } from "../entity/category.entity.js";
import { DivisionSchema } from "../entity/division.entity.js";

const serviceRepository = AppDataSource.getRepository(ServiceSchema);
const categoryRepository = AppDataSource.getRepository(CategorySchema);
const divisionRepository = AppDataSource.getRepository(DivisionSchema);

export const createService = async (data) => {
  const { name, description, categoryId, divisionId, price, imageUrl, rating } = data;
  
  // Verificar si ya existe un servicio con el mismo nombre
  const existingService = await serviceRepository.findOneBy({ name });
  if (existingService) {
    throw new Error("Ya existe un servicio con este nombre");
  }

  // Validar que la categoría existe
  const category = await categoryRepository.findOneBy({ id: categoryId });
  if (!category) {
    throw new Error("Categoría no encontrada");
  }

  // Validar que la división existe
  const division = await divisionRepository.findOneBy({ id: divisionId });
  if (!division) {
    throw new Error("División no encontrada");
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

  // Recargar con relaciones
  const completeService = await serviceRepository.findOne({
    where: { id: service.id },
    relations: ["category", "division"]
  });

  return completeService;
};

export const updateService = async (id, data) => {
  const service = await serviceRepository.findOne({
    where: { id },
    relations: ["category", "division"]
  });

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

  // Actualizar la categoría si se proporciona
  if (data.categoryId) {
    const category = await categoryRepository.findOneBy({ id: data.categoryId });
    if (!category) {
      throw new Error("Categoría no encontrada");
    }
    service.category = category;
  }

  // Actualizar la división si se proporciona
  if (data.divisionId) {
    const division = await divisionRepository.findOneBy({ id: data.divisionId });
    if (!division) {
      throw new Error("División no encontrada");
    }
    service.division = division;
  }

  // Actualizar otros campos
  if (data.name) service.name = data.name;
  if (data.description) service.description = data.description;
  if (data.price !== undefined) service.price = data.price;
  if (data.imageUrl) service.imageUrl = data.imageUrl;
  if (data.rating !== undefined) service.rating = data.rating;
  if (data.isActive !== undefined) service.isActive = data.isActive;

  await serviceRepository.save(service);

  // Recargar con relaciones
  const updatedService = await serviceRepository.findOne({
    where: { id },
    relations: ["category", "division"]
  });

  return updatedService;
};

export const getServices = async () => {
  const services = await serviceRepository.find({
    relations: ["category", "division"],
    relations: ["category", "division"],
    order: { name: "ASC" }
  });
  return services;
};

export const getActiveServices = async () => {
  const services = await serviceRepository.find({
    where: { isActive: true },
    relations: ["category", "division"],
    order: { name: "ASC" }
  });
  return services;
};

export const getServiceById = async (id) => {
  const service = await serviceRepository.findOne({
    where: { id },
    relations: ["category", "division", "quoteItems"]
  });
  return service;
};

export const getServicesByDivision = async (divisionId) => {
  const division = await divisionRepository.findOneBy({ id: divisionId });
  if (!division) {
    throw new Error("División no encontrada");
  }

  const services = await serviceRepository.find({
    where: { division: { id: divisionId } },
    relations: ["category", "division"],
    order: { name: "ASC" }
  });
  return services;
};

export const getServicesByCategory = async (categoryId) => {
  const category = await categoryRepository.findOneBy({ id: categoryId });
  if (!category) {
    throw new Error("Categoría no encontrada");
  }

  const services = await serviceRepository.find({
    where: { category: { id: categoryId } },
    relations: ["category", "division"],
    where: { category: { id: categoryId } },
    relations: ["category", "division"],
    order: { name: "ASC" }
  });
  return services;
};

export const updateServiceRating = async (id, rating) => {
  if (rating < 0 || rating > 5) {
    throw new Error("El rating debe estar entre 0 y 5");
  }

  const service = await serviceRepository.findOne({
    where: { id },
    relations: ["category", "division"]
  });

  if (!service) {
    throw new Error("Servicio no encontrado");
  }

  service.rating = rating;
  await serviceRepository.save(service);
  
  return service;
};

export const deleteService = async (id) => {
  const serviceId = parseInt(id);
  
  // Verificar si el servicio existe
  const service = await serviceRepository.findOne({
    where: { id: serviceId },
    relations: ["quoteItems"]
  });

  if (!service) {
    throw new Error("Servicio no encontrado");
  }

  // Verificar si tiene quote items asociados
  if (service.quoteItems && service.quoteItems.length > 0) {
    throw new Error(`No se puede eliminar el servicio porque tiene ${service.quoteItems.length} cotización(es) asociada(s)`);
  }

  // Hard delete - eliminar completamente
  await serviceRepository.remove(service);
  
  return { mensaje: "Servicio eliminado exitosamente" };
};

export const deleteServiceImage = async (id) => {
  const service = await serviceRepository.findOneBy({ id });
  if (!service || !service.image) {
    throw new Error("No hay imagen para eliminar");
  }
  const imagePath = path.join(process.cwd(), "uploads", service.image);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
  service.image = null;
  await serviceRepository.save(service);
  return true;
};