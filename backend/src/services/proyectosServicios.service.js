"use strict";
import { AppDataSource } from "../config/configDb.js";
import { ProyectoServicioSchema } from "../entity/proyectoServicio.entity.js";
import { ClienteSchema } from "../entity/user.entity.cliente.js";

const proyectoServicioRepository = AppDataSource.getRepository(ProyectoServicioSchema);
const clienteRepository = AppDataSource.getRepository(ClienteSchema);

export const createProyectoServicio = async (data) => {
  const { clienteId, nombreProyecto, tipoServicio, fechaInicio, fechaFinEstimada, estadoProyecto, descripcionProyecto } = data;
  
  // Verificar que el cliente existe
  const clienteExistente = await clienteRepository.findOneBy({ id: clienteId });
  if (!clienteExistente) {
    throw new Error("Cliente no encontrado");
  }

  // Verificar si ya existe un proyecto con el mismo nombre para el mismo cliente
  const proyectoExistente = await proyectoServicioRepository.findOneBy({ 
    clienteId, 
    nombreProyecto 
  });
  if (proyectoExistente) {
    throw new Error("Ya existe un proyecto con este nombre para este cliente");
  }

  const proyecto = proyectoServicioRepository.create({
    clienteId,
    nombreProyecto,
    tipoServicio,
    fechaInicio,
    fechaFinEstimada,
    estadoProyecto: estadoProyecto || "pendiente",
    descripcionProyecto
  });

  await proyectoServicioRepository.save(proyecto);
  return proyecto;
};

export const updateProyectoServicio = async (id, data) => {
  const proyecto = await proyectoServicioRepository.findOneBy({ id });
  if (!proyecto) {
    throw new Error("Proyecto servicio no encontrado");
  }

  // Si se está cambiando el cliente, verificar que existe
  if (data.clienteId && data.clienteId !== proyecto.clienteId) {
    const clienteExistente = await clienteRepository.findOneBy({ id: data.clienteId });
    if (!clienteExistente) {
      throw new Error("Cliente no encontrado");
    }
  }

  // Si se está actualizando el nombre del proyecto, verificar que no exista otro con el mismo nombre para el mismo cliente
  if (data.nombreProyecto && data.nombreProyecto !== proyecto.nombreProyecto) {
    const clienteId = data.clienteId || proyecto.clienteId;
    const proyectoExistente = await proyectoServicioRepository.findOneBy({ 
      clienteId, 
      nombreProyecto: data.nombreProyecto 
    });
    if (proyectoExistente && proyectoExistente.id !== id) {
      throw new Error("Ya existe un proyecto con este nombre para este cliente");
    }
  }

  Object.assign(proyecto, data);
  await proyectoServicioRepository.save(proyecto);
  return proyecto;
};

export const getProyectosServicios = async () => {
  const proyectos = await proyectoServicioRepository.find({
    relations: ["cliente"],
    order: { fechaInicio: "DESC" }
  });
  return proyectos;
};

export const getProyectoServicioById = async (id) => {
  const proyecto = await proyectoServicioRepository.findOne({
    where: { id },
    relations: ["cliente", "vinilosUtilizados"]
  });
  return proyecto;
};

export const getProyectosPorCliente = async (clienteId) => {
  const proyectos = await proyectoServicioRepository.find({
    where: { clienteId },
    relations: ["cliente"],
    order: { fechaInicio: "DESC" }
  });
  return proyectos;
};

export const getProyectosPorEstado = async (estadoProyecto) => {
  const proyectos = await proyectoServicioRepository.find({
    where: { estadoProyecto },
    relations: ["cliente"],
    order: { fechaInicio: "DESC" }
  });
  return proyectos;
};

export const getProyectosPorTipoServicio = async (tipoServicio) => {
  const proyectos = await proyectoServicioRepository.find({
    where: { tipoServicio },
    relations: ["cliente"],
    order: { fechaInicio: "DESC" }
  });
  return proyectos;
};

export const actualizarEstadoProyecto = async (id, nuevoEstado) => {
  const estadosValidos = ["pendiente", "en_proceso", "completado", "cancelado"];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error("Estado de proyecto no válido");
  }

  const proyecto = await proyectoServicioRepository.findOneBy({ id });
  if (!proyecto) {
    throw new Error("Proyecto servicio no encontrado");
  }

  proyecto.estadoProyecto = nuevoEstado;
  await proyectoServicioRepository.save(proyecto);
  return proyecto;
};

export const deleteProyectoServicio = async (id) => {
  const proyecto = await proyectoServicioRepository.findOneBy({ id });
  if (!proyecto) {
    throw new Error("Proyecto servicio no encontrado");
  }

  await proyectoServicioRepository.remove(proyecto);
  return { mensaje: "Proyecto servicio eliminado exitosamente" };
};
