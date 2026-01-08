"use strict";
import { AppDataSource } from "../config/configDb.js";
import { ClienteSchema } from "../entity/user.entity.client.js";

const clienteRepository = AppDataSource.getRepository(ClienteSchema);

export const createCliente = async (data) => {
  // Soporte para nombre y campo heredado nombreEmpresaOPersona
  const { name, nombreEmpresaOPersona, rut, contactoPrincipal, telefono, email, direccion } = data;

  const clientName = name || nombreEmpresaOPersona;

  // Verificar si ya existe un cliente con el mismo nombre
  const clienteExistente = await clienteRepository.findOneBy({ name: clientName });
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
    name: clientName,
    rut,
    company: contactoPrincipal, // Mapping contactoPrincipal to likely 'company' or similar? 
    // Wait, Schema has 'company'. Service had 'contactoPrincipal'.
    // Logic check: if 'contactoPrincipal' was passed, where did it go?
    // In original code (9288): line 35 `contactoPrincipal`. 
    // Schema (9342) DOES NOT have `contactoPrincipal`. 
    // It has `company`.
    // Maybe `contactoPrincipal` was mapped to `company`?
    // Let's assume 'company' is what we want.
    company: data.company || contactoPrincipal,
    phone: telefono,
    email,
    // La dirección fue eliminada del esquema, se ignora.
    isActive: true, // Activo por defecto
    clientType: data.clientType || 'individual',
    source: 'manual'
  });

  await clienteRepository.save(cliente);
  return cliente;
};

export const updateCliente = async (id, data) => {
  const cliente = await clienteRepository.findOneBy({ id });
  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }

  // Manejar actualización de nombre
  const newName = data.name || data.nombreEmpresaOPersona;
  if (newName && newName !== cliente.name) {
    const clienteExistente = await clienteRepository.findOneBy({ name: newName });
    if (clienteExistente) {
      throw new Error("Ya existe un cliente con este nombre");
    }
    cliente.name = newName;
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

  // Mapear otros campos
  if (data.telefono) cliente.phone = data.telefono;
  if (data.phone) cliente.phone = data.phone;
  if (data.company) cliente.company = data.company;
  if (data.contactoPrincipal) cliente.company = data.contactoPrincipal;
  if (data.rut) cliente.rut = data.rut;
  if (data.email) cliente.email = data.email;
  // Address ignored
  if (data.clientType) cliente.clientType = data.clientType;
  if (data.isActive !== undefined) cliente.isActive = data.isActive;

  await clienteRepository.save(cliente);
  return cliente;
};

export const getClientes = async () => {
  const clientes = await clienteRepository.find({
    order: { name: "ASC" }
  });
  return clientes;
};

export const getClienteById = async (id) => {
  const cliente = await clienteRepository.findOne({
    where: { id },
    relations: ["proyectos", "quotes", "orders"]
  });
  return cliente;
};

export const getClienteByNombre = async (name) => {
  const cliente = await clienteRepository.findOneBy({ name });
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
    order: { name: "ASC" }
  });
  return clientes;
};

export const deleteCliente = async (id) => {
  const cliente = await clienteRepository.findOne({
    where: { id },
    relations: ["proyectos", "quotes", "orders"] // Asegurar revisión de todas las relaciones
  });

  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }

  // Verificar si hay dependencias activas (historial)
  const hasHistory =
    (cliente.proyectos && cliente.proyectos.length > 0) ||
    (cliente.quotes && cliente.quotes.length > 0) ||
    (cliente.orders && cliente.orders.length > 0);

  if (hasHistory) {
    // Soft Delete
    cliente.isActive = false;
    await clienteRepository.save(cliente);
    return {
      mensaje: "Cliente archivado correctamente (tiene historial activo). Podrás encontrarlo en los filtros de 'Inactivos'.",
      softDeleted: true
    };
  }

  try {
    await clienteRepository.remove(cliente);
    return { mensaje: "Cliente eliminado exitosamente" };
  } catch (error) {
    if (error.code === '23503') {
      // Fallback por si acaso falló la verificación manual
      await clienteRepository.update(id, { isActive: false });
      return {
        mensaje: "Cliente archivado correctamente (tiene historial activo). Podrás encontrarlo en los filtros de 'Inactivos'.",
        softDeleted: true
      };
    }
    throw error;
  }
};
