"use strict";
import { AppDataSource } from "../config/configDb.js";
import ProductoViniloSchema from "../entity/productoVinilo.entity.js";

const productoViniloRepository = AppDataSource.getRepository(ProductoViniloSchema);

export const createProductoVinilo = async (data) => {
  const { nombre, tipoVinilo, color, cantidadDisponible, descripcion } = data;
  
  // Verificar si ya existe un producto con el mismo nombre
  const productoExistente = await productoViniloRepository.findOneBy({ nombre });
  if (productoExistente) {
    throw new Error("Ya existe un producto vinilo con este nombre");
  }

  const producto = productoViniloRepository.create({
    nombre,
    tipoVinilo,
    color,
    cantidadDisponible: cantidadDisponible || 0,
    descripcion,
    activo: true
  });

  await productoViniloRepository.save(producto);
  return producto;
};

export const updateProductoVinilo = async (id, data) => {
  const producto = await productoViniloRepository.findOneBy({ id });
  if (!producto) {
    throw new Error("Producto vinilo no encontrado");
  }

  // Si se está actualizando el nombre, verificar que no exista otro producto con ese nombre
  if (data.nombre && data.nombre !== producto.nombre) {
    const productoExistente = await productoViniloRepository.findOneBy({ nombre: data.nombre });
    if (productoExistente) {
      throw new Error("Ya existe un producto vinilo con este nombre");
    }
  }

  Object.assign(producto, data);
  await productoViniloRepository.save(producto);
  return producto;
};

export const getProductosVinilo = async () => {
  const productos = await productoViniloRepository.find({
    where: { activo: true },
    order: { fechaCreacion: "DESC" }
  });
  return productos;
};

export const getProductoViniloById = async (id) => {
  const producto = await productoViniloRepository.findOne({
    where: { id, activo: true },
    relations: ["usosEnProyectos"]
  });
  return producto;
};

export const deleteProductoVinilo = async (id) => {
  const producto = await productoViniloRepository.findOneBy({ id });
  if (!producto) {
    throw new Error("Producto vinilo no encontrado");
  }

  // Soft delete - marcar como inactivo en lugar de eliminar físicamente
  producto.activo = false;
  await productoViniloRepository.save(producto);
  return producto;
};

export const actualizarInventario = async (id, cantidad) => {
  const producto = await productoViniloRepository.findOneBy({ id });
  if (!producto) {
    throw new Error("Producto vinilo no encontrado");
  }

  if (producto.cantidadDisponible + cantidad < 0) {
    throw new Error("No hay suficiente inventario disponible");
  }

  producto.cantidadDisponible += cantidad;
  await productoViniloRepository.save(producto);
  return producto;
};
