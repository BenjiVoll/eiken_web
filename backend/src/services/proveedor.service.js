"use strict";
import { AppDataSource } from "../config/configDb.js";
import { ProveedorSchema } from "../entity/proveedor.entity.js";

const proveedorRepository = AppDataSource.getRepository(ProveedorSchema);

export const createProveedor = async (data) => {
  const { nombre, contacto, telefono, email } = data;
  
  // Verificar si ya existe un proveedor con el mismo nombre
  const proveedorExistente = await proveedorRepository.findOneBy({ nombre });
  if (proveedorExistente) {
    throw new Error("Ya existe un proveedor con este nombre");
  }

  // Verificar si ya existe un proveedor con el mismo email (si se proporciona)
  if (email) {
    const proveedorEmail = await proveedorRepository.findOneBy({ email });
    if (proveedorEmail) {
      throw new Error("Ya existe un proveedor con este email");
    }
  }

  const proveedor = proveedorRepository.create({
    nombre,
    contacto,
    telefono,
    email
  });

  await proveedorRepository.save(proveedor);
  return proveedor;
};

export const updateProveedor = async (id, data) => {
  const proveedor = await proveedorRepository.findOneBy({ id });
  if (!proveedor) {
    throw new Error("Proveedor no encontrado");
  }

  // Si se está actualizando el nombre, verificar que no exista otro proveedor con ese nombre
  if (data.nombre && data.nombre !== proveedor.nombre) {
    const proveedorExistente = await proveedorRepository.findOneBy({ nombre: data.nombre });
    if (proveedorExistente) {
      throw new Error("Ya existe un proveedor con este nombre");
    }
  }

  // Si se está actualizando el email, verificar que no exista otro proveedor con ese email
  if (data.email && data.email !== proveedor.email) {
    const proveedorEmail = await proveedorRepository.findOneBy({ email: data.email });
    if (proveedorEmail) {
      throw new Error("Ya existe un proveedor con este email");
    }
  }

  Object.assign(proveedor, data);
  await proveedorRepository.save(proveedor);
  return proveedor;
};

export const getProveedores = async () => {
  const proveedores = await proveedorRepository.find({
    order: { nombre: "ASC" }
  });
  return proveedores;
};

export const getProveedorById = async (id) => {
  const proveedor = await proveedorRepository.findOneBy({ id });
  return proveedor;
};

export const getProveedorByNombre = async (nombre) => {
  const proveedor = await proveedorRepository.findOneBy({ nombre });
  return proveedor;
};

export const getProveedorByEmail = async (email) => {
  const proveedor = await proveedorRepository.findOneBy({ email });
  return proveedor;
};

export const deleteProveedor = async (id) => {
  const proveedor = await proveedorRepository.findOneBy({ id });
  if (!proveedor) {
    throw new Error("Proveedor no encontrado");
  }

  await proveedorRepository.remove(proveedor);
  return { mensaje: "Proveedor eliminado exitosamente" };
};
