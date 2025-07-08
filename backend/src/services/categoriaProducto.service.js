"use strict";
import { AppDataSource } from "../config/configDb.js";
import { CategoriaProductoSchema } from "../entity/categoriaProducto.entity.js";

const categoriaProductoRepository = AppDataSource.getRepository(CategoriaProductoSchema);

export const createCategoriaProducto = async (data) => {
  const { nombre, descripcion } = data;
  
  // Verificar si ya existe una categoría con el mismo nombre
  const categoriaExistente = await categoriaProductoRepository.findOneBy({ nombre });
  if (categoriaExistente) {
    throw new Error("Ya existe una categoría de producto con este nombre");
  }

  const categoria = categoriaProductoRepository.create({
    nombre,
    descripcion
  });

  await categoriaProductoRepository.save(categoria);
  return categoria;
};

export const updateCategoriaProducto = async (id, data) => {
  const categoria = await categoriaProductoRepository.findOneBy({ id });
  if (!categoria) {
    throw new Error("Categoría de producto no encontrada");
  }

  // Si se está actualizando el nombre, verificar que no exista otra categoría con ese nombre
  if (data.nombre && data.nombre !== categoria.nombre) {
    const categoriaExistente = await categoriaProductoRepository.findOneBy({ nombre: data.nombre });
    if (categoriaExistente) {
      throw new Error("Ya existe una categoría de producto con este nombre");
    }
  }

  Object.assign(categoria, data);
  await categoriaProductoRepository.save(categoria);
  return categoria;
};

export const getCategoriasProducto = async () => {
  const categorias = await categoriaProductoRepository.find({
    order: { nombre: "ASC" }
  });
  return categorias;
};

export const getCategoriaProductoById = async (id) => {
  const categoria = await categoriaProductoRepository.findOneBy({ id });
  return categoria;
};

export const getCategoriaProductoByNombre = async (nombre) => {
  const categoria = await categoriaProductoRepository.findOneBy({ nombre });
  return categoria;
};

export const deleteCategoriaProducto = async (id) => {
  const categoria = await categoriaProductoRepository.findOneBy({ id });
  if (!categoria) {
    throw new Error("Categoría de producto no encontrada");
  }

  await categoriaProductoRepository.remove(categoria);
  return { mensaje: "Categoría de producto eliminada exitosamente" };
};
