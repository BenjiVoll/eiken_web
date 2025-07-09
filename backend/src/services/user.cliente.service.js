"use strict";
import { AppDataSource } from "../config/configDb.js";
import { ClienteSchema } from "../entity/user.entity.client.js";

const clienteRepository = AppDataSource.getRepository(ClienteSchema);

export const createCliente = async (data) => {
  const { nombreEmpresaOPersona, rut, contactoPrincipal, telefono, email, direccion } = data;
  
  // Verificar si ya existe un cliente con el mismo nombre
  const clienteExistente = await clienteRepository.findOneBy({ nombreEmpresaOPersona });
  if (clienteExistente) {
    throw new Error("Ya existe un cliente con este nombre");
  }

  // Verificar si ya existe un cliente con el mismo RUT (si se proporciona)
  if (rut) {
    const clienteRut = await clienteRepository.findOneBy({ rut });
    if (clienteRut) {
      throw new Error("Ya existe un cliente con este RUT");
    }
  }

  // Verificar si ya existe un cliente con el mismo email (si se proporciona)
  if (email) {
    const clienteEmail = await clienteRepository.findOneBy({ email });
    if (clienteEmail) {
      throw new Error("Ya existe un cliente con este email");
    }
  }

  const cliente = clienteRepository.create({
    nombreEmpresaOPersona,
    rut,
    contactoPrincipal,
    telefono,
    email,
    direccion
  });

  await clienteRepository.save(cliente);
  return cliente;
};

export const updateCliente = async (id, data) => {
  const cliente = await clienteRepository.findOneBy({ id });
  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }

  // Si se está actualizando el nombre, verificar que no exista otro cliente con ese nombre
  if (data.nombreEmpresaOPersona && data.nombreEmpresaOPersona !== cliente.nombreEmpresaOPersona) {
    const clienteExistente = await clienteRepository.findOneBy({ nombreEmpresaOPersona: data.nombreEmpresaOPersona });
    if (clienteExistente) {
      throw new Error("Ya existe un cliente con este nombre");
    }
  }

  // Si se está actualizando el RUT, verificar que no exista otro cliente con ese RUT
  if (data.rut && data.rut !== cliente.rut) {
    const clienteRut = await clienteRepository.findOneBy({ rut: data.rut });
    if (clienteRut) {
      throw new Error("Ya existe un cliente con este RUT");
    }
  }

  // Si se está actualizando el email, verificar que no exista otro cliente con ese email
  if (data.email && data.email !== cliente.email) {
    const clienteEmail = await clienteRepository.findOneBy({ email: data.email });
    if (clienteEmail) {
      throw new Error("Ya existe un cliente con este email");
    }
  }

  Object.assign(cliente, data);
  await clienteRepository.save(cliente);
  return cliente;
};

export const getClientes = async () => {
  const clientes = await clienteRepository.find({
    order: { nombreEmpresaOPersona: "ASC" }
  });
  return clientes;
};

export const getClienteById = async (id) => {
  const cliente = await clienteRepository.findOne({
    where: { id },
    relations: ["proyectos"]
  });
  return cliente;
};

export const getClienteByNombre = async (nombreEmpresaOPersona) => {
  const cliente = await clienteRepository.findOneBy({ nombreEmpresaOPersona });
  return cliente;
};

export const getClienteByRut = async (rut) => {
  const cliente = await clienteRepository.findOneBy({ rut });
  return cliente;
};

export const getClienteByEmail = async (email) => {
  const cliente = await clienteRepository.findOneBy({ email });
  return cliente;
};

export const getClientesConProyectos = async () => {
  const clientes = await clienteRepository.find({
    relations: ["proyectos"],
    order: { nombreEmpresaOPersona: "ASC" }
  });
  return clientes;
};

export const deleteCliente = async (id) => {
  const cliente = await clienteRepository.findOne({
    where: { id },
    relations: ["proyectos"]
  });
  
  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }

  // Verificar si el cliente tiene proyectos asociados
  if (cliente.proyectos && cliente.proyectos.length > 0) {
    throw new Error("No se puede eliminar el cliente porque tiene proyectos asociados");
  }

  await clienteRepository.remove(cliente);
  return { mensaje: "Cliente eliminado exitosamente" };
};
