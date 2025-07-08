"use strict";
import { AppDataSource } from "../config/configDb.js";
import { DetalleUsoViniloProyectoSchema } from "../entity/detalleUsoViniloProyecto.entity.js";
import ProductoViniloSchema from "../entity/productoVinilo.entity.js";
import { ProyectoServicioSchema } from "../entity/proyectoServicio.entity.js";

const detalleUsoViniloRepository = AppDataSource.getRepository(DetalleUsoViniloProyectoSchema);
const productoViniloRepository = AppDataSource.getRepository(ProductoViniloSchema);
const proyectoServicioRepository = AppDataSource.getRepository(ProyectoServicioSchema);

export const createDetalleUsoVinilo = async (data) => {
  const { proyectoId, productoViniloId, rollosUtilizados, metrosCuadradosUtilizados, fechaUso } = data;
  
  // Verificar que el proyecto existe
  const proyecto = await proyectoServicioRepository.findOneBy({ id: proyectoId });
  if (!proyecto) {
    throw new Error("Proyecto no encontrado");
  }

  // Verificar que el producto vinilo existe y está activo
  const productoVinilo = await productoViniloRepository.findOneBy({ id: productoViniloId, activo: true });
  if (!productoVinilo) {
    throw new Error("Producto vinilo no encontrado o inactivo");
  }

  // Verificar que hay suficiente inventario disponible
  if (productoVinilo.cantidadDisponible < rollosUtilizados) {
    throw new Error("No hay suficiente inventario disponible");
  }

  const detalleUso = detalleUsoViniloRepository.create({
    proyectoId,
    productoViniloId,
    rollosUtilizados,
    metrosCuadradosUtilizados,
    fechaUso: fechaUso || new Date()
  });

  await detalleUsoViniloRepository.save(detalleUso);

  // Actualizar el inventario del producto vinilo
  productoVinilo.cantidadDisponible -= rollosUtilizados;
  await productoViniloRepository.save(productoVinilo);

  return detalleUso;
};

export const updateDetalleUsoVinilo = async (id, data) => {
  const detalleUso = await detalleUsoViniloRepository.findOneBy({ id });
  if (!detalleUso) {
    throw new Error("Detalle de uso de vinilo no encontrado");
  }

  // Si se está cambiando la cantidad de rollos utilizados, actualizar inventario
  if (data.rollosUtilizados !== undefined && data.rollosUtilizados !== detalleUso.rollosUtilizados) {
    const productoVinilo = await productoViniloRepository.findOneBy({ id: detalleUso.productoViniloId });
    if (!productoVinilo) {
      throw new Error("Producto vinilo no encontrado");
    }

    const diferencia = data.rollosUtilizados - detalleUso.rollosUtilizados;
    
    if (productoVinilo.cantidadDisponible - diferencia < 0) {
      throw new Error("No hay suficiente inventario disponible para esta actualización");
    }

    productoVinilo.cantidadDisponible -= diferencia;
    await productoViniloRepository.save(productoVinilo);
  }

  Object.assign(detalleUso, data);
  await detalleUsoViniloRepository.save(detalleUso);
  return detalleUso;
};

export const getDetallesUsoVinilo = async () => {
  const detalles = await detalleUsoViniloRepository.find({
    relations: ["proyectoServicio", "productoVinilo"],
    order: { fechaUso: "DESC" }
  });
  return detalles;
};

export const getDetalleUsoViniloById = async (id) => {
  const detalle = await detalleUsoViniloRepository.findOne({
    where: { id },
    relations: ["proyectoServicio", "productoVinilo"]
  });
  return detalle;
};

export const getDetallesUsoViniloPorProyecto = async (proyectoId) => {
  const detalles = await detalleUsoViniloRepository.find({
    where: { proyectoId },
    relations: ["productoVinilo"],
    order: { fechaUso: "DESC" }
  });
  return detalles;
};

export const getDetallesUsoViniloPorProducto = async (productoViniloId) => {
  const detalles = await detalleUsoViniloRepository.find({
    where: { productoViniloId },
    relations: ["proyectoServicio"],
    order: { fechaUso: "DESC" }
  });
  return detalles;
};

export const deleteDetalleUsoVinilo = async (id) => {
  const detalleUso = await detalleUsoViniloRepository.findOneBy({ id });
  if (!detalleUso) {
    throw new Error("Detalle de uso de vinilo no encontrado");
  }

  // Devolver la cantidad al inventario antes de eliminar
  const productoVinilo = await productoViniloRepository.findOneBy({ id: detalleUso.productoViniloId });
  if (productoVinilo) {
    productoVinilo.cantidadDisponible += detalleUso.rollosUtilizados;
    await productoViniloRepository.save(productoVinilo);
  }

  await detalleUsoViniloRepository.remove(detalleUso);
  return { mensaje: "Detalle de uso eliminado y inventario restaurado" };
};
