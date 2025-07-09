"use strict";
import { AppDataSource } from "../config/configDb.js";
import { ClientSchema } from "../entity/user.entity.client.js";

const clientRepository = AppDataSource.getRepository(ClientSchema);

export const createClient = async (data) => {
  const { name, email, phone, company, rut, address, clientType } = data;
  
  // Verificar si ya existe un cliente con el mismo email
  const existingClientEmail = await clientRepository.findOneBy({ email });
  if (existingClientEmail) {
    throw new Error("Ya existe un cliente con este email");
  }

  // Verificar si ya existe un cliente con el mismo RUT (si se proporciona)
  if (rut) {
    const existingClientRut = await clientRepository.findOneBy({ rut });
    if (existingClientRut) {
      throw new Error("Ya existe un cliente con este RUT");
    }
  }

  const client = clientRepository.create({
    name,
    email,
    phone,
    company,
    rut,
    address,
    clientType: clientType || "individual",
    isActive: true
  });

  await clientRepository.save(client);
  return client;
};

export const updateClient = async (id, data) => {
  const client = await clientRepository.findOneBy({ id });
  if (!client) {
    throw new Error("Cliente no encontrado");
  }

  // Si se está actualizando el email, verificar que no exista otro cliente con ese email
  if (data.email && data.email !== client.email) {
    const existingClient = await clientRepository.findOneBy({ email: data.email });
    if (existingClient) {
      throw new Error("Ya existe un cliente con este email");
    }
  }

  // Si se está actualizando el RUT, verificar que no exista otro cliente con ese RUT
  if (data.rut && data.rut !== client.rut) {
    const existingClient = await clientRepository.findOneBy({ rut: data.rut });
    if (existingClient) {
      throw new Error("Ya existe un cliente con este RUT");
    }
  }

  Object.assign(client, data);
  await clientRepository.save(client);
  return client;
};

export const getClients = async () => {
  const clients = await clientRepository.find({
    where: { isActive: true },
    order: { name: "ASC" }
  });
  return clients;
};

export const getClientById = async (id) => {
  const client = await clientRepository.findOne({
    where: { id, isActive: true },
    relations: ["projects", "quotes", "orders"]
  });
  return client;
};

export const getClientByEmail = async (email) => {
  const client = await clientRepository.findOneBy({ email, isActive: true });
  return client;
};

export const getClientByRut = async (rut) => {
  const client = await clientRepository.findOneBy({ rut, isActive: true });
  return client;
};

export const getClientsWithProjects = async () => {
  const clients = await clientRepository.find({
    where: { isActive: true },
    relations: ["projects"],
    order: { name: "ASC" }
  });
  return clients;
};

export const deleteClient = async (id) => {
  const client = await clientRepository.findOne({
    where: { id },
    relations: ["projects", "orders"]
  });
  
  if (!client) {
    throw new Error("Cliente no encontrado");
  }

  // Verificar si el cliente tiene proyectos o órdenes activas
  if (client.projects && client.projects.length > 0) {
    throw new Error("No se puede eliminar el cliente porque tiene proyectos asociados");
  }

  if (client.orders && client.orders.length > 0) {
    throw new Error("No se puede eliminar el cliente porque tiene órdenes asociadas");
  }

  // Soft delete - marcar como inactivo
  client.isActive = false;
  await clientRepository.save(client);
  
  return { mensaje: "Cliente eliminado exitosamente" };
};
